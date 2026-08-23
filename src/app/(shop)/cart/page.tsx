import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCart } from "@/lib/shopify/cart";
import { formatMoney } from "@/lib/shopify/format-money";
import CartLineControls from "@/components/shop/CartLineControls";
import CartLineShade from "@/components/shop/CartLineShade";
import CartPromoForm from "@/components/shop/CartPromoForm";
import CheckoutButton from "@/components/shop/CheckoutButton";
import CartTotals from "@/components/shop/CartTotals";
import CartMobileCheckoutBar from "@/components/shop/CartMobileCheckoutBar";
import { UNTRACKED_MAX_QTY } from "@/lib/shopify/inventory";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Your Bag",
    pathname: "/cart",
    robots: "noindex",
});

export default async function CartPage() {
    const cart = await getCart();
    const lines = cart?.lines.nodes ?? [];

    return (
        <main id="main-content" className="min-h-screen bg-ivory pb-28 lg:pb-12">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="reveal font-heading text-3xl font-bold text-charcoal sm:text-4xl">Your Bag</h1>

                {lines.length === 0 ? (
                    <div className="reveal mt-12 rounded-2xl border border-charcoal/10 bg-paper-alt p-12 text-center">
                        <p className="text-charcoal/70">Your bag is empty.</p>
                        <Link
                            href="/shop"
                            className="font-accent mt-6 inline-flex rounded-full bg-gold px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-all hover:bg-gold-dark"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="reveal mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
                        <div className="min-w-0 space-y-6">
                            {lines.map((line) => {
                                const maxQty =
                                    typeof line.merchandise.quantityAvailable === "number" &&
                                    line.merchandise.quantityAvailable > 0
                                        ? line.merchandise.quantityAvailable
                                        : UNTRACKED_MAX_QTY;
                                return (
                                <div key={line.id} className="flex gap-4 border-b border-charcoal/10 pb-6 transition-colors">
                                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-paper-alt">
                                        {line.merchandise.image && (
                                            <Image
                                                src={line.merchandise.image.url}
                                                alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        )}
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                                        <div>
                                            <p className="font-heading text-base font-semibold text-charcoal">
                                                {line.merchandise.product.title}
                                            </p>
                                            <p className="text-xs text-charcoal/70">
                                                {line.merchandise.selectedOptions.map((o) => o.value).join(" / ")}
                                            </p>
                                            <CartLineShade attributes={line.attributes} className="mt-0.5 text-xs text-charcoal/70" />
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                                            <CartLineControls
                                                lineId={line.id}
                                                quantity={line.quantity}
                                                maxQuantity={maxQty}
                                            />
                                            <p className="shrink-0 text-price text-sm text-charcoal">
                                                {formatMoney(line.cost.totalAmount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                            })}
                        </div>

                        <aside className="h-fit min-w-0 rounded-2xl border border-charcoal/10 bg-paper-alt p-6">
                            <CartPromoForm cart={cart} />
                            <div className="mt-5 border-t border-charcoal/10 pt-5">
                                <CartTotals cart={cart} />
                            </div>
                            <p className="mt-3 text-xs text-charcoal/70">
                                Shipping and taxes calculated at checkout.
                            </p>
                            {cart && <CheckoutButton cart={cart} />}
                        </aside>
                    </div>
                )}
            </div>
            {cart && lines.length > 0 && <CartMobileCheckoutBar cart={cart} />}
        </main>
    );
}
