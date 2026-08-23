import { NextRequest, NextResponse } from "next/server";
import { getProductsPage } from "@/lib/shopify/products";
import { PRODUCT_LIST_PAGE_SIZE } from "@/lib/shopify/catalog-pagination";
import type { SortKey } from "@/lib/shopify/types";

/** Mirrors Hydrogen's app/routes/api.catalog-products.tsx loader exactly. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const after = url.searchParams.get("after");
  const sort = (url.searchParams.get("sort") as SortKey | null) ?? "newest";

  const priceMin = url.searchParams.get("priceMin");
  const priceMax = url.searchParams.get("priceMax");
  const collections = url.searchParams.getAll("collection").filter(Boolean);
  const query = url.searchParams.get("q");
  const first = url.searchParams.get("first");

  const result = await getProductsPage({
    sort,
    after,
    first: first ? Number(first) : PRODUCT_LIST_PAGE_SIZE,
    filters: {
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      collections: collections.length ? collections : undefined,
      query: query?.trim() ? query : undefined,
    },
  });

  return NextResponse.json(result);
}
