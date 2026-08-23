import { shopifyFetch } from "@/lib/shopify/client";
import { getProductsPage } from "@/lib/shopify/products";
import type { ProductCard } from "@/lib/shopify/types";

export const DEFAULT_FEATURED_COLLECTION_HANDLE = "featured";

export type HomepageFeatured = {
  featuredCollectionHandle: string;
  featuredCount: number | null;
};

const HOMEPAGE_FEATURED_QUERY = /* GraphQL */ `
  query HomepageFeatured {
    shop {
      homepageFeatured: metafield(namespace: "custom", key: "homepage_featured") {
        value
      }
    }
  }
`;

function resolveFeaturedCount(value: number | string | null | undefined): number | null {
  if (value == null || value === "" || value === "all") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

export async function loadHomepageFeatured(): Promise<HomepageFeatured> {
  try {
    const data = await shopifyFetch<{
      shop: { homepageFeatured: { value: string } | null };
    }>({ query: HOMEPAGE_FEATURED_QUERY, revalidate: 3600 });

    const parsed = JSON.parse(data.shop.homepageFeatured?.value ?? "{}") as {
      featuredCollectionHandle?: string;
      featuredCount?: number | string | null;
    };

    return {
      featuredCollectionHandle:
        parsed.featuredCollectionHandle ?? DEFAULT_FEATURED_COLLECTION_HANDLE,
      featuredCount: resolveFeaturedCount(parsed.featuredCount),
    };
  } catch {
    return {
      featuredCollectionHandle: DEFAULT_FEATURED_COLLECTION_HANDLE,
      featuredCount: 8,
    };
  }
}

export async function loadFeaturedProducts(): Promise<ProductCard[]> {
  const { featuredCollectionHandle, featuredCount } = await loadHomepageFeatured();
  const { products } = await getProductsPage({
    filters: { collections: [featuredCollectionHandle] },
    first: featuredCount ?? 12,
    sort: "featured",
  });
  return products;
}
