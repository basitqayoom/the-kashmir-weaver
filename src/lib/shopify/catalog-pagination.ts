import type { ProductCard } from "./types";

export type CatalogPageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type PaginatedProducts = {
  products: ProductCard[];
  pageInfo: CatalogPageInfo;
};

export type CatalogFilters = {
  priceMin?: number;
  priceMax?: number;
  /** Shopify collection handles — match any (OR). */
  collections?: string[];
  /** Free-text query — matched client-side against title/type/vendor. */
  query?: string;
};

export function serializeFilters(filters: CatalogFilters): string {
  const parts: string[] = [];
  if (filters.priceMin !== undefined) parts.push(`pmin:${filters.priceMin}`);
  if (filters.priceMax !== undefined) parts.push(`pmax:${filters.priceMax}`);
  if (filters.collections?.length) {
    parts.push(`cols:${[...filters.collections].sort().join("|")}`);
  }
  if (filters.query?.trim()) {
    parts.push(`q:${filters.query.trim().toLowerCase()}`);
  }
  return parts.join(",") || "__none__";
}

/** True when a product belongs to any of the selected collection handles. */
export function productMatchesCollections(
  product: ProductCard,
  handles: string[],
): boolean {
  if (!handles.length) return true;
  const selected = new Set(handles);
  return Boolean(
    product.collections?.nodes.some((c) => selected.has(c.handle)),
  );
}

/** True when the free-text query matches the product's title, type, vendor, or collections. */
export function productMatchesText(
  product: ProductCard,
  query: string,
): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const haystack = [
    product.title,
    product.productType,
    product.vendor,
    ...(product.collections?.nodes.map((c) => c.title) ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(trimmed);
}

/** Products per grid page. Matches Hydrogen's PRODUCT_LIST_PAGE_SIZE. */
export const PRODUCT_LIST_PAGE_SIZE = 24;

/** Batch size used when assembling the full catalog snapshot for client-side filtering. */
export const PRODUCT_FETCH_BATCH_SIZE = 50;

/** Safety cap on how many batches to fetch when gathering the full catalog for filtering. */
export const PRODUCT_FETCH_MAX_BATCHES = 20;
