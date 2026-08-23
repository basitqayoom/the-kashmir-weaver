"use client";

import { normalizeCartCheckoutUrl } from "@/lib/shopify/resolve-checkout-url";
import {
    cartToGaItems,
    trackBeginCheckout,
} from "@/components/GoogleAnalytics";
import { trackInitiateCheckout } from "@/components/MetaPixel";
import { gidTail } from "@/lib/tracking-ids";
import { formatMoney } from "@/lib/shopify/format-money";
import type { Cart } from "@/lib/shopify/types";

export default function CartMobileCheckoutBar({ cart }: { cart: Cart }) {
    const checkoutUrl = normalizeCartCheckoutUrl(cart.checkoutUrl);

    return (
        <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-ivory px-4 py-3 lg:hidden"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
            <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/70">Total</p>
                    <p className="text-price text-lg text-charcoal">
                        {formatMoney(cart.cost.totalAmount)}
                    </p>
                </div>
                <a
                    href={checkoutUrl}
                    onClick={() => {
                        const items = cartToGaItems(cart);
                        const value = Number(cart.cost.totalAmount.amount);
                        const currency = cart.cost.totalAmount.currencyCode;
                        trackBeginCheckout(items, value, currency);
                        trackInitiateCheckout({
                            content_ids: cart.lines.nodes.map((l) => gidTail(l.merchandise.id)),
                            content_type: "product",
                            value,
                            currency,
                            num_items: cart.totalQuantity,
                        });
                    }}
                    className="font-accent shrink-0 bg-gold px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal"
                >
                    Checkout
                </a>
            </div>
        </div>
    );
}
