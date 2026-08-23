import { shopifyFetch } from "./client";
import { SHOP_POLICY_QUERY } from "./queries";
import type { ShopPolicy } from "./types";

export type PolicyKey =
  | "privacyPolicy"
  | "termsOfService"
  | "shippingPolicy"
  | "refundPolicy";

export async function getShopPolicy(
  policy: PolicyKey,
): Promise<ShopPolicy | null> {
  const data = await shopifyFetch<{
    shop: Partial<Record<PolicyKey, ShopPolicy | null>>;
  }>({
    query: SHOP_POLICY_QUERY,
    variables: {
      privacyPolicy: policy === "privacyPolicy",
      termsOfService: policy === "termsOfService",
      shippingPolicy: policy === "shippingPolicy",
      refundPolicy: policy === "refundPolicy",
    },
    revalidate: 3600,
  });

  return data.shop[policy] ?? null;
}
