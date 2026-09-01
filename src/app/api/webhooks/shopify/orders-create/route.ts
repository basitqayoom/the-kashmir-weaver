import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isCapiConfigured, sendCapiEvent } from "@/lib/meta-capi";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type ShopifyOrder = {
  id?: number | string;
  order_status_url?: string;
  currency?: string;
  total_price?: string;
  email?: string;
  phone?: string;
  customer?: { first_name?: string; last_name?: string; phone?: string };
  billing_address?: { city?: string; country_code?: string; zip?: string; phone?: string };
  line_items?: Array<{
    variant_id?: number | string;
    quantity?: number;
    price?: string;
    title?: string;
  }>;
};

function verifyShopifyHmac(rawBody: string, header: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const provided = Buffer.from(header, "base64");
  return digest.length === provided.length && timingSafeEqual(digest, provided);
}

/**
 * Shopify `orders/create` → Meta Purchase. The event ID matches the one the
 * checkout custom pixel emits (`purchase_<orderId>`), so Meta deduplicates the
 * browser and server copies into a single conversion.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifyShopifyHmac(rawBody, request.headers.get("x-shopify-hmac-sha256"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!isCapiConfigured()) {
    return NextResponse.json({ ok: true, skipped: "capi-not-configured" });
  }

  let order: ShopifyOrder;
  try {
    order = JSON.parse(rawBody) as ShopifyOrder;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const orderId = order.id ? String(order.id) : "";
  const lineItems = order.line_items ?? [];
  const contentIds = lineItems
    .map((item) => (item.variant_id ? String(item.variant_id) : ""))
    .filter(Boolean);

  if (!orderId || !contentIds.length) {
    return NextResponse.json({ ok: true, skipped: "incomplete-order" });
  }

  const result = await sendCapiEvent({
    eventName: "Purchase",
    eventId: `purchase_${orderId}`,
    eventSourceUrl: order.order_status_url ?? siteConfig.url,
    customData: {
      content_ids: contentIds,
      content_type: "product",
      contents: lineItems
        .filter((item) => item.variant_id)
        .map((item) => ({
          id: String(item.variant_id),
          quantity: item.quantity ?? 1,
          item_price: Number(item.price ?? 0),
        })),
      value: Number(order.total_price ?? 0),
      currency: order.currency ?? "USD",
      num_items: lineItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
      order_id: orderId,
    },
    user: {
      email: order.email,
      phone: order.phone ?? order.customer?.phone ?? order.billing_address?.phone,
      firstName: order.customer?.first_name,
      lastName: order.customer?.last_name,
      city: order.billing_address?.city,
      country: order.billing_address?.country_code,
      zip: order.billing_address?.zip,
    },
  }).catch(() => ({ ok: false, status: 502 }));

  // Always 200 so Shopify does not retry on a downstream Meta failure.
  return NextResponse.json({ ok: result.ok });
}
