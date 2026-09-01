import { shopifyFetch } from "./client";
import { PRODUCT_FEED_QUERY } from "./queries";
import type { FeedProduct } from "@/lib/feeds/merchant-feed";

const BATCH_SIZE = 50;
const MAX_BATCHES = 20;
const FEED_REVALIDATE_SECONDS = 3600;

type ProductFeedResponse = {
  products: {
    nodes: FeedProduct[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

/** Full variant-level catalogue for the Google/Meta/Pinterest merchant feeds. */
export async function getProductsForMerchantFeed(): Promise<FeedProduct[]> {
  const all: FeedProduct[] = [];
  let after: string | null = null;

  for (let batch = 0; batch < MAX_BATCHES; batch++) {
    const data: ProductFeedResponse = await shopifyFetch<ProductFeedResponse>({
      query: PRODUCT_FEED_QUERY,
      variables: { first: BATCH_SIZE, after },
      revalidate: FEED_REVALIDATE_SECONDS,
    });
    all.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }

  return all;
}
