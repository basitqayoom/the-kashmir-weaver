// Thin fetch wrapper around Shopify's Storefront API — no SDK dependency needed,
// the Storefront API is a plain GraphQL/HTTPS endpoint.

const domain = process.env.PUBLIC_STORE_DOMAIN;
const token = process.env.PUBLIC_STOREFRONT_API_TOKEN;
const apiVersion = process.env.PUBLIC_STOREFRONT_API_VERSION ?? "2026-01";

function endpoint(): string {
  if (!domain || !token) {
    throw new Error(
      "Missing PUBLIC_STORE_DOMAIN / PUBLIC_STOREFRONT_API_TOKEN — set them in .env.local",
    );
  }
  return `https://${domain}/api/${apiVersion}/graphql.json`;
}

export class ShopifyStorefrontError extends Error {
  constructor(
    message: string,
    public readonly graphQLErrors?: unknown,
  ) {
    super(message);
    this.name = "ShopifyStorefrontError";
  }
}

export async function shopifyFetch<T>(options: {
  query: string;
  variables?: Record<string, unknown>;
  /** Seconds to cache this query for (Next.js fetch cache). Mutations should pass 0. */
  revalidate?: number;
}): Promise<T> {
  const { query, variables, revalidate = 60 } = options;

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token as string,
    },
    body: JSON.stringify({ query, variables }),
    next: revalidate > 0 ? { revalidate } : undefined,
    cache: revalidate > 0 ? undefined : "no-store",
  });

  if (!res.ok) {
    throw new ShopifyStorefrontError(
      `Shopify Storefront API request failed: ${res.status} ${res.statusText}`,
    );
  }

  const json = await res.json();

  if (json.errors) {
    throw new ShopifyStorefrontError(
      "Shopify Storefront API returned errors",
      json.errors,
    );
  }

  return json.data as T;
}
