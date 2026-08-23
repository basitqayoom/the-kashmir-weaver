// Minimal, hand-written types for the slice of the Storefront API schema this
// storefront actually queries — no full codegen, kept small and purpose-fit.

export type Money = {
  amount: string;
  currencyCode: string;
};

export type StorefrontImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  sku?: string | null;
  weight?: number | null;
  weightUnit?: string | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  image: StorefrontImage | null;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductMetafield = {
  key: string;
  value: string;
} | null;

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  createdAt: string;
  updatedAt?: string;
  featuredImage: StorefrontImage | null;
  images: { nodes: StorefrontImage[] };
  options: ProductOption[];
  collections: { nodes: { handle: string; title: string }[] };
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange?: {
    minVariantPrice: Money;
  } | null;
  availableForSale?: boolean;
};

export type ProductDetail = ProductCard & {
  description: string;
  descriptionHtml: string;
  tags: string[];
  publishedAt: string | null;
  seo: { title: string | null; description: string | null } | null;
  images: { nodes: StorefrontImage[] };
  variants: { nodes: ProductVariant[] };
  shortDescription: ProductMetafield;
  story: ProductMetafield;
  material: ProductMetafield;
  origin: ProductMetafield;
  weave: ProductMetafield;
  care: ProductMetafield;
  limited: ProductMetafield;
  requestPrice: ProductMetafield;
  requestMoreImages: ProductMetafield;
  stockQty: ProductMetafield;
  guaranteesDelivery: ProductMetafield;
  returnsCare: ProductMetafield;
  shadePalette: ProductMetafield;
  showColourStudio: ProductMetafield;
  reviewRating: ProductMetafield;
  reviewCount: ProductMetafield;
};

/** A single selectable value inside a native Shopify product filter facet. */
export type FilterValue = {
  id: string;
  label: string;
  count: number;
  /** Ready-to-use JSON-encoded ProductFilter fragment for the next query. */
  input: string;
};

/** A facet Shopify computes automatically from what's actually in the catalog/collection. */
export type ProductFilter = {
  id: string;
  label: string;
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN";
  values: FilterValue[];
};

export type ProductConnection = {
  nodes: ProductCard[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

export type CartLine = {
  id: string;
  quantity: number;
  attributes: { key: string; value: string }[];
  cost: {
    totalAmount: Money;
    amountPerQuantity: Money;
  };
  merchandise: {
    id: string;
    title: string;
    availableForSale?: boolean;
    quantityAvailable?: number | null;
    selectedOptions: SelectedOption[];
    image: StorefrontImage | null;
    product: {
      handle: string;
      title: string;
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  discountCodes: { code: string; applicable: boolean }[];
  discountAllocations?: { discountedAmount: Money }[];
  appliedGiftCards?: {
    id: string;
    lastCharacters: string;
    amountUsed: Money;
  }[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: { nodes: CartLine[] };
};

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";

/** Sort keys exposed in the /shop UI — matches Hydrogen's ProductCatalog exactly. */
export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export const DEFAULT_CATALOG_SORT: SortKey = "newest";

export type Collection = {
  handle: string;
  title: string;
  description?: string;
  image?: StorefrontImage | null;
};

/**
 * Maps to the plain `products(sortKey:, reverse:)` field's native
 * ProductSortKeys enum — mirrors Hydrogen's getSortConfig exactly.
 * "featured" has no manual/curated ordering on the flat all-products list,
 * so it falls back to the same default as "newest".
 */
export function sortKeyToStorefront(sort: SortKey): {
  sortKey: string;
  reverse: boolean;
} {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "newest":
    case "featured":
    default:
      return { sortKey: "CREATED_AT", reverse: true };
  }
}

export type ShopPolicy = {
  title: string;
  body: string;
  handle: string;
  url: string;
};
