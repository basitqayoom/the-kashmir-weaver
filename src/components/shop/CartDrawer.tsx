"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
    closeCartDrawer,
    getCartUiSnapshot,
    getCartUiServerSnapshot,
    notifyCartUpdated,
    subscribeCartUi,
} from "@/lib/cart-ui";
import { updateCartLineAction, removeCartLineAction } from "@/app/(shop)/cart/actions";
import { formatMoney } from "@/lib/shopify/format-money";
import { gidTail } from "@/lib/tracking-ids";
import { UNTRACKED_MAX_QTY } from "@/lib/shopify/inventory";
import { getCartPromotionSummary } from "@/lib/cart-promotions";
import {
    cartToGaItems,
    trackBeginCheckout,
    trackRemoveFromCart,
    trackViewCart,
} from "@/components/GoogleAnalytics";
import {
    trackInitiateCheckout,
    trackViewCartMeta,
} from "@/components/MetaPixel";
import { normalizeCartCheckoutUrl } from "@/lib/shopify/resolve-checkout-url";
import Spinner from "@/components/Spinner";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useBottomSheetDrag } from "@/hooks/use-bottom-sheet-drag";
import type { CartLine } from "@/lib/shopify/types";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import CartLineShade from "./CartLineShade";
import CartPromoForm from "./CartPromoForm";
import CartTotals from "./CartTotals";

const CLOSE_MS = 300;

function lineMaxQuantity(line: CartLine): number {
    const merch = line.merchandise;
    if (
        typeof merch.quantityAvailable === "number" &&
        merch.quantityAvailable > 0
    ) {
        return merch.quantityAvailable;
    }
    return UNTRACKED_MAX_QTY;
}

export default function CartDrawer() {
    const { isOpen, cart, loading } = useSyncExternalStore(
        subscribeCartUi,
        getCartUiSnapshot,
        getCartUiServerSnapshot
    );

    const [visible, setVisible] = useState(false);
    const closingRef = useRef(false);
    const panelRef = useRef<HTMLDivElement>(null);
    useFocusTrap(isOpen && visible, panelRef);

    const requestClose = useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;
        setVisible(false);
        window.setTimeout(closeCartDrawer, CLOSE_MS);
    }, []);

    const {
        dragY,
        isBottomSheet,
        overlayOpacity,
        dragHandleProps,
    } = useBottomSheetDrag({
        enabled: isOpen && visible,
        panelRef,
        onDismiss: requestClose,
    });

    const backdropOpacity = visible
        ? isBottomSheet && overlayOpacity != null
            ? overlayOpacity
            : 1
        : 0;

    const panelTransform = isBottomSheet
        ? visible
            ? `translateY(${dragY}px)`
            : "translateY(100%)"
        : visible
          ? "translateX(0)"
          : "translateX(100%)";

    useEffect(() => {
        if (!isOpen) return;
        closingRef.current = false;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") requestClose();
        };
        window.addEventListener("keydown", onKey);
        lockScroll();
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => {
            window.removeEventListener("keydown", onKey);
            unlockScroll();
            cancelAnimationFrame(raf);
        };
    }, [isOpen, requestClose]);

    const viewedCartRef = useRef<string | null>(null);
    useEffect(() => {
        if (!isOpen || !cart || cart.totalQuantity === 0) return;
        const key = `${cart.id}:${cart.totalQuantity}:${cart.cost.totalAmount.amount}`;
        if (viewedCartRef.current === key) return;
        viewedCartRef.current = key;
        const items = cartToGaItems(cart);
        const value = Number(cart.cost.totalAmount.amount);
        const currency = cart.cost.totalAmount.currencyCode;
        trackViewCart(items, value, currency);
        trackViewCartMeta({
            content_ids: cart.lines.nodes.map((l) => gidTail(l.merchandise.id)),
            content_type: "product",
            value,
            currency,
            num_items: cart.totalQuantity,
        });
    }, [isOpen, cart]);

    const lines = cart?.lines.nodes ?? [];
    const promotion = getCartPromotionSummary(cart);
    const displayMoney =
        promotion.hasAdjustments && promotion.total
            ? promotion.total
            : promotion.subtotal;
    const displayTotalLabel = displayMoney
        ? formatMoney(displayMoney)
        : "—";
    const checkoutUrl = cart?.checkoutUrl
        ? normalizeCartCheckoutUrl(cart.checkoutUrl)
        : undefined;

    if (!isOpen || typeof document === "undefined") return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            onClick={requestClose}
            className="fixed inset-0 z-60 flex items-end justify-center overflow-hidden backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none md:items-stretch md:justify-end"
            style={{
                background: "rgba(45, 42, 38, 0.4)",
                opacity: backdropOpacity,
                pointerEvents: visible ? "auto" : "none",
            }}
        >
            <div
                ref={panelRef}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className="flex h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)))] w-full max-w-md flex-col overflow-x-hidden rounded-t-2xl border-t border-charcoal/10 bg-ivory shadow-2xl outline-none motion-reduce:transition-none md:ml-auto md:h-full md:max-h-none md:rounded-none md:border-l md:border-t-0"
                style={{
                    transform: panelTransform,
                    transition: dragY > 0 ? "none" : undefined,
                    transitionDuration: dragY > 0 ? undefined : "300ms",
                    transitionTimingFunction: dragY > 0 ? undefined : "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
            >
                <div className="shrink-0 select-none md:pointer-events-none">
                    <div
                        className="mx-auto mt-3 h-1 w-10 rounded-full bg-charcoal/15 md:hidden"
                        aria-hidden
                        {...dragHandleProps}
                    />
                    <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4 md:px-6 md:py-5">
                        <h2 className="font-heading text-lg font-bold text-charcoal">
                            Your Bag{" "}
                            {cart && cart.totalQuantity > 0
                                ? `(${cart.totalQuantity})`
                                : ""}
                        </h2>
                        <button
                            type="button"
                            onClick={requestClose}
                            aria-label="Close bag"
                            className="flex h-10 w-10 shrink-0 items-center justify-center text-charcoal/70 transition-colors hover:text-charcoal"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {loading && !cart ? (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-charcoal/70">
                        <Spinner size="lg" label="Loading your bag" />
                        <p className="text-sm">Loading your bag…</p>
                    </div>
                ) : lines.length === 0 ? (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 text-center">
                        <svg className="h-10 w-10 text-charcoal/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m-.75 10.5h9a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <p className="mt-4 text-sm text-charcoal/70">Your bag is empty.</p>
                        <button
                            type="button"
                            onClick={requestClose}
                            className="font-accent mt-6 bg-gold px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-gold-dark"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-4 md:px-6">
                            <ul className="space-y-5">
                                {lines.map((line) => (
                                    <li key={line.id} className="flex gap-4">
                                        <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-paper-alt">
                                            {line.merchandise.image && (
                                                <Image
                                                    src={line.merchandise.image.url}
                                                    alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/products/${line.merchandise.product.handle}`}
                                            onClick={closeCartDrawer}
                                            className="block break-words font-heading text-sm font-semibold leading-snug text-charcoal transition-colors hover:text-gold-text"
                                        >
                                            {line.merchandise.product.title}
                                        </Link>
                                            <p className="break-words text-xs text-charcoal/70">
                                                {line.merchandise.selectedOptions.map((o) => o.value).join(" / ")}
                                            </p>
                                            <CartLineShade attributes={line.attributes} className="mt-0.5 text-xs text-charcoal/70" />
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center border border-charcoal/15 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => startCartUpdate(line.id, line.quantity - 1)}
                                                        className="px-2.5 py-1 text-charcoal/70"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-6 text-center text-charcoal">{line.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => startCartUpdate(line.id, line.quantity + 1, lineMaxQuantity(line))}
                                                        disabled={line.quantity >= lineMaxQuantity(line)}
                                                        className="px-2.5 py-1 text-charcoal/70 disabled:opacity-40"
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <p className="text-price text-sm text-charcoal">
                                                    {formatMoney(line.cost.totalAmount)}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => startCartRemove(line.id, line)}
                                                className="mt-1 text-xs text-charcoal/70 underline-offset-2 hover:text-burgundy hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Mobile sticky footer */}
                        <div
                            className="shrink-0 border-t border-charcoal/10 px-5 pt-3 md:hidden"
                            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
                        >
                            {promotion.hasAdjustments && (
                                <div className="mb-3">
                                    <CartTotals cart={cart} compact />
                                </div>
                            )}
                            <CartPromoForm cart={cart} compact />
                            <div className="mt-3 flex items-center gap-3 border-t border-charcoal/10 pt-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/70">Total</p>
                                    <p className="truncate text-lg text-charcoal">{displayTotalLabel}</p>
                                </div>
                                {checkoutUrl ? (
                                    <a
                                        href={checkoutUrl}
                                        onClick={() => cart && handleCheckoutClick(cart)}
                                        className="font-accent shrink-0 bg-gold px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal"
                                    >
                                        Checkout
                                    </a>
                                ) : (
                                    <Link
                                        href="/cart"
                                        onClick={requestClose}
                                        className="font-accent shrink-0 bg-gold px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal"
                                    >
                                        View bag
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Desktop footer */}
                        <div className="hidden shrink-0 space-y-3 border-t border-charcoal/10 px-6 py-5 md:block">
                            <CartTotals cart={cart} compact />
                            <CartPromoForm cart={cart} compact />
                            <p className="text-xs text-charcoal/70">
                                Shipping and taxes calculated at checkout.
                            </p>
                            {checkoutUrl ? (
                                <a
                                    href={checkoutUrl}
                                    onClick={() => cart && handleCheckoutClick(cart)}
                                    className="font-accent block w-full bg-gold px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-all hover:bg-gold-dark"
                                >
                                    Checkout
                                </a>
                            ) : null}
                            <Link
                                href="/cart"
                                onClick={requestClose}
                                className="block text-center text-xs text-charcoal/70 underline-offset-2 hover:underline"
                            >
                                View full bag
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body,
    );
}

function startCartUpdate(lineId: string, quantity: number, maxQty = UNTRACKED_MAX_QTY) {
    const next = Math.min(Math.max(quantity, 0), maxQty);
    void updateCartLineAction(lineId, next).then(notifyCartUpdated);
}

function startCartRemove(
    lineId: string,
    line?: {
        merchandise: {
            id: string;
            product: { title: string; vendor?: string; productType?: string };
            title: string;
        };
        quantity: number;
        cost: { amountPerQuantity: { amount: string; currencyCode: string } };
    },
) {
    if (line) {
        trackRemoveFromCart(
            {
                item_id: line.merchandise.id,
                item_name: line.merchandise.product.title,
                item_variant: line.merchandise.title,
                item_brand: line.merchandise.product.vendor || undefined,
                item_category: line.merchandise.product.productType || undefined,
                price: Number(line.cost.amountPerQuantity.amount),
                quantity: line.quantity,
            },
            line.cost.amountPerQuantity.currencyCode,
        );
    }
    void removeCartLineAction(lineId).then(notifyCartUpdated);
}

function handleCheckoutClick(cart: NonNullable<ReturnType<typeof getCartUiSnapshot>["cart"]>) {
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
}
