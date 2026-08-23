import { buildRssXml } from "@/lib/feeds/build-rss";
import {
  mapProductsToFeedItems,
  productsFeedChannel,
} from "@/lib/feeds/product-feed";
import { getAllProductsForCatalog } from "@/lib/shopify/products";

export async function GET() {
  const products = await getAllProductsForCatalog();
  const xml = buildRssXml(
    productsFeedChannel(),
    mapProductsToFeedItems(products),
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
