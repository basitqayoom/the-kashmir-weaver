"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
    applyDiscountCodeAction,
    applyGiftCardAction,
    removeDiscountCodeAction,
} from "@/app/(shop)/cart/actions";
import { notifyCartUpdated } from "@/lib/cart-ui";
import Spinner from "@/components/Spinner";
import { getCartPromotionSummary } from "@/lib/cart-promotions";
import type { Cart } from "@/lib/shopify/types";

export default function CartPromoForm({
    cart,
    compact = false,
}: {
    cart: Cart | null;
    compact?: boolean;
}) {
    const [promoCode, setPromoCode] = useState("");
    const [giftCode, setGiftCode] = useState("");
    const [isPending, startTransition] = useTransition();
    const [promoError, setPromoError] = useState<string | null>(null);
    const [giftError, setGiftError] = useState<string | null>(null);

    const { appliedDiscountCodes, rejectedDiscountCodes, appliedGiftCards } =
        getCartPromotionSummary(cart);

    function handleApplyPromo(e: FormEvent) {
        e.preventDefault();
        const trimmed = promoCode.trim();
        if (!trimmed) return;
        setPromoError(null);
        startTransition(async () => {
            try {
                await applyDiscountCodeAction(trimmed);
                notifyCartUpdated();
                setPromoCode("");
            } catch (err) {
                setPromoError(err instanceof Error ? err.message : "Couldn't apply that code.");
            }
        });
    }

    function handleApplyGift(e: FormEvent) {
        e.preventDefault();
        const trimmed = giftCode.trim();
        if (!trimmed) return;
        setGiftError(null);
        startTransition(async () => {
            try {
                await applyGiftCardAction(trimmed);
                notifyCartUpdated();
                setGiftCode("");
            } catch (err) {
                setGiftError(err instanceof Error ? err.message : "Couldn't apply that gift card.");
            }
        });
    }

    function handleRemovePromo(codeToRemove: string) {
        startTransition(async () => {
            await removeDiscountCodeAction(codeToRemove);
            notifyCartUpdated();
        });
    }

    const labelClass = compact
        ? "font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70"
        : "font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70";

    return (
        <div className={compact ? "space-y-3" : "space-y-4"}>
            <div>
                <p className={labelClass}>Promo Code</p>
                <form onSubmit={handleApplyPromo} className="mt-2 flex items-stretch gap-2">
                    <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                        aria-label="Promo code"
                        autoComplete="off"
                        className="min-w-0 flex-1 border border-charcoal/15 bg-transparent px-3 py-2.5 text-sm tracking-wide text-charcoal placeholder:text-charcoal/70 focus:border-gold focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isPending || !promoCode.trim()}
                        className="flex shrink-0 items-center justify-center gap-2 border border-charcoal/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition-colors hover:border-gold/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending && <Spinner size="sm" label="Applying code" />}
                        Apply
                    </button>
                </form>
                {promoError && (
                    <p className="mt-2 text-xs text-burgundy" role="alert">{promoError}</p>
                )}
                {rejectedDiscountCodes.length > 0 && (
                    <p className="mt-2 text-xs text-burgundy" role="alert">
                        {rejectedDiscountCodes.length === 1
                            ? `"${rejectedDiscountCodes[0]}" isn't valid for this bag.`
                            : `These codes aren't valid: ${rejectedDiscountCodes.join(", ")}.`}
                    </p>
                )}
                {appliedDiscountCodes.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-2">
                        {appliedDiscountCodes.map((code) => (
                            <li
                                key={code}
                                className="flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-text"
                            >
                                {code}
                                <button
                                    type="button"
                                    onClick={() => handleRemovePromo(code)}
                                    aria-label={`Remove promo code ${code}`}
                                    className="text-gold-text/60 transition-colors hover:text-gold-text"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <p className={labelClass}>Gift Card</p>
                <form onSubmit={handleApplyGift} className="mt-2 flex items-stretch gap-2">
                    <input
                        type="text"
                        value={giftCode}
                        onChange={(e) => setGiftCode(e.target.value)}
                        placeholder="Gift card code"
                        aria-label="Gift card code"
                        autoComplete="off"
                        className="min-w-0 flex-1 border border-charcoal/15 bg-transparent px-3 py-2.5 text-sm tracking-wide text-charcoal placeholder:text-charcoal/70 focus:border-gold focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isPending || !giftCode.trim()}
                        className="flex shrink-0 items-center justify-center gap-2 border border-charcoal/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition-colors hover:border-gold/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending && <Spinner size="sm" label="Applying gift card" />}
                        Apply
                    </button>
                </form>
                {giftError && (
                    <p className="mt-2 text-xs text-burgundy" role="alert">{giftError}</p>
                )}
                {appliedGiftCards.length > 0 && (
                    <p className="mt-2 text-xs text-charcoal/70">
                        Gift cards applied
                        {appliedGiftCards.map((g) => ` ···· ${g.lastCharacters}`).join("")}
                    </p>
                )}
            </div>
        </div>
    );
}
