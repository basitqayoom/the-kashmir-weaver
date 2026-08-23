import { buildAtomXml } from "@/lib/feeds/build-atom";
import {
  mapProductsToFeedItems,
  productsFeedChannel,
} from "@/lib/feeds/product-feed";
import { getAllProductsForCatalog } from "@/lib/shopify/products";

export const revalidate = 3600;

export async function GET() {
  const products = await getAllProductsForCatalog();
  const xml = buildAtomXml(
    productsFeedChannel("atom"),
    mapProductsToFeedItems(products),
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
