import { NextRequest, NextResponse } from "next/server";
import { buyNowLines } from "@/lib/shopify/cart";
import { normalizeCartCheckoutUrl } from "@/lib/shopify/resolve-checkout-url";
import { shadeCartAttributesFromSearch } from "@/lib/shopify/shade-cart";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lines: string }> },
) {
  const { lines: linesParam } = await context.params;
  if (!linesParam) {
    return NextResponse.redirect(new URL("/cart", request.url));
  }

  const linesMap = linesParam.split(",").map((line) => {
    const [variantId, qtyRaw] = line.split(":");
    const quantity = parseInt(qtyRaw ?? "1", 10);
    return {
      merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    };
  });

  const searchParams = request.nextUrl.searchParams;
  const shadeAttributes = shadeCartAttributesFromSearch(searchParams);
  const discount = searchParams.get("discount");
  const discountCodes = discount ? [discount] : [];

  const linesWithAttributes = linesMap.map((line) =>
    shadeAttributes.length ? { ...line, attributes: shadeAttributes } : line,
  );

  try {
    const cart = await buyNowLines(linesWithAttributes, discountCodes);
    const checkoutUrl = normalizeCartCheckoutUrl(cart.checkoutUrl);
    if (!checkoutUrl) {
      return NextResponse.redirect(new URL("/cart", request.url));
    }
    return NextResponse.redirect(checkoutUrl);
  } catch {
    return new NextResponse("Link may be expired. Try checking the URL.", {
      status: 410,
    });
  }
}
