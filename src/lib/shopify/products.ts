import { shopifyFetch } from "./client";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  COLOUR_STUDIO_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "./queries";
import { sortKeyToStorefront } from "./types";
import { parseShadePalette, type Shade } from "./colour-studio";
import type {
  ProductCard,
  ProductConnection,
  ProductDetail,
  ProductMetafield,
  SortKey,
  Collection,
} from "./types";
import {
  productMatchesCollections,
  productMatchesText,
  PRODUCT_LIST_PAGE_SIZE,
  PRODUCT_FETCH_BATCH_SIZE,
  PRODUCT_FETCH_MAX_BATCHES,
  type CatalogFilters,
  type PaginatedProducts,
} from "./catalog-pagination";

type ProductsResponse = {
  products: { nodes: ProductCard[]; pageInfo: ProductConnection["pageInfo"] };
};

export async function getProducts(options: {
  first?: number;
  after?: string | null;
  sort?: SortKey;
}): Promise<ProductConnection> {
  const { first = 24, after = null, sort = "featured" } = options;
  const { sortKey, reverse } = sortKeyToStorefront(sort);

  const data = await shopifyFetch<ProductsResponse>({
    query: PRODUCTS_QUERY,
    variables: { first, after, sortKey, reverse },
  });

  return {
    nodes: data.products.nodes,
    pageInfo: data.products.pageInfo,
  };
}

/** Fetches the entire catalog (paged internally) — used for client-side filters and the sitemap. */
export async function getAllProductsForCatalog(
  sort: SortKey = "newest",
): Promise<ProductCard[]> {
  const { sortKey, reverse } = sortKeyToStorefront(sort);
  const all: ProductCard[] = [];
  let after: string | null = null;

  for (let batch = 0; batch < PRODUCT_FETCH_MAX_BATCHES; batch++) {
    const data: ProductsResponse = await shopifyFetch<ProductsResponse>({
      query: PRODUCTS_QUERY,
      variables: { first: PRODUCT_FETCH_BATCH_SIZE, after, sortKey, reverse },
    });
    all.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }

  return all;
}

function applyStaticFilters(
  products: ProductCard[],
  filters: CatalogFilters,
): ProductCard[] {
  return products.filter((p) => {
    if (p.availableForSale === false) return false;
    if (
      filters.priceMin !== undefined &&
      Number(p.priceRange.minVariantPrice.amount) < filters.priceMin
    ) {
      return false;
    }
    if (
      filters.priceMax !== undefined &&
      Number(p.priceRange.minVariantPrice.amount) > filters.priceMax
    ) {
      return false;
    }
    if (
      filters.collections?.length &&
      !productMatchesCollections(p, filters.collections)
    ) {
      return false;
    }
    if (filters.query?.trim() && !productMatchesText(p, filters.query)) {
      return false;
    }
    return true;
  });
}

function paginateOffset(
  products: ProductCard[],
  first: number,
  after: string | null | undefined,
): PaginatedProducts {
  const start = after ? Number.parseInt(after, 10) : 0;
  const offset = Number.isFinite(start) ? start : 0;
  const slice = products.slice(offset, offset + first);
  const nextOffset = offset + slice.length;
  const hasNextPage = nextOffset < products.length;
  return {
    products: slice,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? String(nextOffset) : null,
    },
  };
}

/**
 * Mirrors Hydrogen's catalog.repository.ts `listProductsPage`: native
 * cursor pagination when no filters are active (efficient), otherwise
 * fetch the whole catalog once and filter/paginate in JS (offset cursor).
 */
export async function getProductsPage(options: {
  sort?: SortKey;
  filters?: CatalogFilters;
  after?: string | null;
  first?: number;
}): Promise<PaginatedProducts> {
  const {
    sort = "newest",
    filters = {},
    after = null,
    first = PRODUCT_LIST_PAGE_SIZE,
  } = options;
  const hasFilters =
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    Boolean(filters.collections?.length) ||
    Boolean(filters.query?.trim());

  if (!hasFilters) {
    const { nodes, pageInfo } = await getProducts({ first, after, sort });
    return {
      products: nodes.filter((p) => p.availableForSale !== false),
      pageInfo,
    };
  }

  const all = await getAllProductsForCatalog(sort);
  const filtered = applyStaticFilters(all, filters);
  return paginateOffset(filtered, first, after);
}

export async function getCollections(): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { nodes: Collection[] } }>({
    query: COLLECTIONS_QUERY,
    revalidate: 3600,
  });
  return data.collections.nodes;
}

export async function getCollectionByHandle(
  handle: string,
): Promise<Collection | null> {
  const data = await shopifyFetch<{ collection: Collection | null }>({
    query: COLLECTION_BY_HANDLE_QUERY,
    variables: { handle },
    revalidate: 3600,
  });
  return data.collection;
}

/** Shopify Search API — relevance-ranked product search. */
export async function searchProducts(options: {
  query: string;
  first?: number;
  after?: string | null;
}): Promise<PaginatedProducts> {
  const { query, first = PRODUCT_LIST_PAGE_SIZE, after = null } = options;
  const term = query.trim();
  if (!term) {
    return { products: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }

  const data = await shopifyFetch<{
    products: { nodes: ProductCard[]; pageInfo: PaginatedProducts["pageInfo"] };
  }>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { term, first, after },
  });

  return {
    products: data.products.nodes.filter((p) => p.availableForSale !== false),
    pageInfo: data.products.pageInfo,
  };
}

export async function getProductByHandle(
  handle: string,
): Promise<ProductDetail | null> {
  const data = await shopifyFetch<{ product: ProductDetail | null }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    revalidate: 3600,
  });

  return data.product;
}

export type ColourStudioProduct = { product: ProductCard; shades: Shade[] };

/**
 * The single solid product that has the colour studio turned on. Identified by
 * metafield rather than a fixed handle, so enabling it on another product in
 * Admin is enough to move the homepage feature.
 */
export async function getColourStudioProduct(
  collectionHandle = "solids",
): Promise<ColourStudioProduct | null> {
  type Node = ProductCard & {
    showColourStudio: ProductMetafield;
    shadePalette: ProductMetafield;
  };

  let after: string | null = null;

  for (let page = 0; page < PRODUCT_FETCH_MAX_BATCHES; page++) {
    const data: {
      collection: {
        products: { nodes: Node[]; pageInfo: ProductConnection["pageInfo"] };
      } | null;
    } = await shopifyFetch({
      query: COLOUR_STUDIO_PRODUCTS_QUERY,
      variables: { handle: collectionHandle, first: 250, after },
      revalidate: 3600,
    });

    const products = data.collection?.products;
    if (!products) return null;

    for (const node of products.nodes) {
      if (node.showColourStudio?.value !== "true") continue;
      const shades = parseShadePalette(node.shadePalette?.value);
      if (shades.length > 0) return { product: node, shades };
    }

    if (!products.pageInfo.hasNextPage) break;
    after = products.pageInfo.endCursor;
  }

  return null;
}
