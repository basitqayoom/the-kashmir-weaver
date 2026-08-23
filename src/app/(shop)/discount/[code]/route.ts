import { NextRequest, NextResponse } from "next/server";
import { updateCartDiscountCodes } from "@/lib/shopify/cart";

/**
 * Automatically applies a discount from the URL.
 * If a cart exists it is updated; otherwise a cart is created when the customer adds items.
 *
 * @example /discount/FREESHIPPING?redirect=/shop
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const url = request.nextUrl;
  const searchParams = new URLSearchParams(url.search);

  let redirectParam =
    searchParams.get("redirect") || searchParams.get("return_to") || "/";

  if (redirectParam.includes("//")) {
    redirectParam = "/";
  }

  searchParams.delete("redirect");
  searchParams.delete("return_to");

  const query = searchParams.toString();
  const redirectPath = query ? `${redirectParam}?${query}` : redirectParam;
  const redirectUrl = new URL(redirectPath, request.url);

  if (!code) {
    return NextResponse.redirect(redirectUrl, 303);
  }

  try {
    await updateCartDiscountCodes([code]);
  } catch {
    // No cart yet — discount will apply on next cart create via buy-now links.
  }

  return NextResponse.redirect(redirectUrl, 303);
}
