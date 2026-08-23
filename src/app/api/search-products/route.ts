import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/shopify/products";
import type { SortKey } from "@/lib/shopify/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const first = Number(searchParams.get("first") ?? 24);
  const after = searchParams.get("after");

  const { products, pageInfo } = await searchProducts({
    query: q,
    first: Number.isFinite(first) ? first : 24,
    after,
  });

  return NextResponse.json({ products, pageInfo, sort: "featured" as SortKey });
}
