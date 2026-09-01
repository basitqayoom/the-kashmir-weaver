import { buildMerchantFeed, type FeedChannelName } from "@/lib/feeds/merchant-feed";
import { getProductsForMerchantFeed } from "@/lib/shopify/merchant-catalog";

/** Shared handler for the Google/Meta/Pinterest catalogue feed routes. */
export async function merchantFeedResponse(channel: FeedChannelName) {
  const products = await getProductsForMerchantFeed();
  const xml = buildMerchantFeed(products, channel);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
