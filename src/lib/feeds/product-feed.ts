import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import type { Collection, ProductCard } from "@/lib/shopify/types";
import type { FeedChannel, FeedItem } from "./types";

const DEFAULT_AUTHOR = siteConfig.name;

function sortFeedItemsNewestFirst(items: FeedItem[]): FeedItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function mapProductToFeedItem(product: ProductCard): FeedItem {
  const link = absoluteUrl(`/products/${product.handle}`);
  const primaryCollection = product.collections.nodes[0];
  const summary =
    primaryCollection?.title ||
    product.productType ||
    product.vendor ||
    product.title;
  const categories = Array.from(
    new Set(
      [
        ...(product.productType ? [product.productType] : []),
        ...product.collections.nodes.map((c) => c.title),
      ].filter(Boolean),
    ),
  );
  const imageUrl = product.featuredImage?.url;

  return {
    title: product.title,
    link,
    id: link,
    summary,
    publishedAt: product.updatedAt ?? product.createdAt,
    author: product.vendor?.trim() || DEFAULT_AUTHOR,
    categories,
    image: imageUrl
      ? {
          url: imageUrl,
          title: product.featuredImage?.altText ?? product.title,
        }
      : undefined,
  };
}

export function mapProductsToFeedItems(products: ProductCard[]): FeedItem[] {
  return sortFeedItemsNewestFirst(products.map(mapProductToFeedItem));
}

export function productsFeedChannel(format: "rss" | "atom" = "rss"): FeedChannel {
  return {
    title: "Products — The Kashmir Weaver",
    link: `${siteConfig.url}/shop`,
    description:
      "New and updated handwoven Kashmiri pashmina products from The Kashmir Weaver.",
    selfUrl: `${siteConfig.url}/products/${format === "atom" ? "atom.xml" : "rss.xml"}`,
    language: "en",
  };
}

export function collectionChannelMeta(collection: Collection): {
  title: string;
  link: string;
  description: string;
} {
  return {
    title: `${collection.title} — The Kashmir Weaver`,
    link: absoluteUrl(`/collections/${collection.handle}`),
    description:
      collection.description?.trim() ||
      `Products in the ${collection.title} collection.`,
  };
}

export function productsInCollection(
  products: ProductCard[],
  handle: string,
): ProductCard[] {
  return products.filter((product) =>
    product.collections.nodes.some((c) => c.handle === handle),
  );
}
