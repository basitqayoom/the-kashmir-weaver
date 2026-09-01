"use client";

import { cartToGaItems, trackBeginCheckout } from "@/components/GoogleAnalytics";
import { trackInitiateCheckout } from "@/components/MetaPixel";
import { trackPinterestCheckout } from "@/components/PinterestTag";
import { gidTail } from "@/lib/tracking-ids";
import { normalizeCartCheckoutUrl } from "@/lib/shopify/resolve-checkout-url";
import type { Cart } from "@/lib/shopify/types";

export default function CheckoutButton({ cart }: { cart: Cart }) {
  function handleClick() {
    const currency = cart.cost.totalAmount.currencyCode;
    const items = cartToGaItems(cart);
    const value = Number(cart.cost.totalAmount.amount);
    trackBeginCheckout(items, value, currency);
    trackInitiateCheckout({
      content_ids: cart.lines.nodes.map((line) => gidTail(line.merchandise.id)),
      content_type: "product",
      contents: cart.lines.nodes.map((line) => ({
        id: gidTail(line.merchandise.id),
        quantity: line.quantity,
        item_price: Number(line.cost.amountPerQuantity.amount),
      })),
      value,
      currency,
      num_items: cart.totalQuantity,
    });
    trackPinterestCheckout(
      cart.lines.nodes.map((line) => ({
        product_id: gidTail(line.merchandise.id),
        product_name: line.merchandise.product.title,
        product_price: Number(line.cost.amountPerQuantity.amount),
        product_quantity: line.quantity,
      })),
      value,
      currency,
    );
  }

    return (
        <a
            href={normalizeCartCheckoutUrl(cart.checkoutUrl)}
            onClick={handleClick}
            className="font-accent mt-6 block w-full rounded-full bg-gold px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-all hover:bg-gold-dark"
        >
            Checkout
        </a>
    );
}
