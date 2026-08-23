"use client";

import { useTransition } from "react";
import { updateCartLineAction, removeCartLineAction } from "@/app/(shop)/cart/actions";
import { notifyCartUpdated } from "@/lib/cart-ui";
import Spinner from "@/components/Spinner";
import { UNTRACKED_MAX_QTY } from "@/lib/shopify/inventory";

export default function CartLineControls({
    lineId,
    quantity,
    maxQuantity = UNTRACKED_MAX_QTY,
}: {
    lineId: string;
    quantity: number;
    maxQuantity?: number;
}) {
    const [isPending, startTransition] = useTransition();

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center border border-charcoal/15">
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                        startTransition(async () => {
                            await updateCartLineAction(lineId, quantity - 1);
                            notifyCartUpdated();
                        })
                    }
                    className="px-3 py-1 text-charcoal/70 disabled:opacity-40"
                    aria-label="Decrease quantity"
                >
                    −
                </button>
                <span className="flex w-8 items-center justify-center text-center text-sm text-charcoal">
                    {isPending ? <Spinner size="sm" label="Updating bag" /> : quantity}
                </span>
                <button
                    type="button"
                    disabled={isPending || quantity >= maxQuantity}
                    onClick={() =>
                        startTransition(async () => {
                            await updateCartLineAction(lineId, Math.min(quantity + 1, maxQuantity));
                            notifyCartUpdated();
                        })
                    }
                    className="px-3 py-1 text-charcoal/70 disabled:opacity-40"
                    aria-label="Increase quantity"
                >
                    +
                </button>
            </div>
            <button
                type="button"
                disabled={isPending}
                onClick={() =>
                    startTransition(async () => {
                        await removeCartLineAction(lineId);
                        notifyCartUpdated();
                    })
                }
                className="text-xs text-charcoal/70 underline-offset-2 hover:text-burgundy hover:underline"
            >
                Remove
            </button>
        </div>
    );
}
