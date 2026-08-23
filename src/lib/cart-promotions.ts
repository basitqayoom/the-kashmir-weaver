import type { Cart, Money } from "@/lib/shopify/types";

export type CartPromotionSummary = {
  subtotal: Money | null;
  total: Money | null;
  discountTotal: number;
  giftCardTotal: number;
  appliedDiscountCodes: string[];
  rejectedDiscountCodes: string[];
  appliedGiftCards: Array<{
    id: string;
    lastCharacters: string;
    amountUsed: Money;
  }>;
  hasAdjustments: boolean;
};

function sumMoneyAmount(items: Array<Money | null | undefined>): number {
  return items.reduce((sum, item) => sum + (item ? Number(item.amount) : 0), 0);
}

export function getCartPromotionSummary(
  cart: Cart | null | undefined,
): CartPromotionSummary {
  const subtotal = cart?.cost?.subtotalAmount ?? null;
  const total = cart?.cost?.totalAmount ?? null;
  const discountTotal = sumMoneyAmount(
    cart?.discountAllocations?.map((a) => a.discountedAmount) ?? [],
  );
  const giftCardTotal = sumMoneyAmount(
    cart?.appliedGiftCards?.map((g) => g.amountUsed) ?? [],
  );
  const appliedDiscountCodes =
    cart?.discountCodes?.filter((c) => c.applicable).map((c) => c.code) ?? [];
  const rejectedDiscountCodes =
    cart?.discountCodes?.filter((c) => !c.applicable).map((c) => c.code) ?? [];
  const appliedGiftCards =
    cart?.appliedGiftCards?.map((g) => ({
      id: g.id,
      lastCharacters: g.lastCharacters,
      amountUsed: g.amountUsed,
    })) ?? [];

  return {
    subtotal,
    total,
    discountTotal,
    giftCardTotal,
    appliedDiscountCodes,
    rejectedDiscountCodes,
    appliedGiftCards,
    hasAdjustments: discountTotal > 0 || giftCardTotal > 0,
  };
}
