import { merchantFeedResponse } from "@/lib/feeds/merchant-feed-response";

export const revalidate = 3600;

export async function GET() {
  return merchantFeedResponse("pinterest");
}
