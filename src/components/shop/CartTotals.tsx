import { formatMoney } from "@/lib/shopify/format-money";
import { getCartPromotionSummary } from "@/lib/cart-promotions";
import type { Cart } from "@/lib/shopify/types";

export default function CartTotals({
  cart,
  compact = false,
}: {
  cart: Cart | null;
  compact?: boolean;
}) {
  const {
    subtotal,
    total,
    discountTotal,
    giftCardTotal,
    hasAdjustments,
  } = getCartPromotionSummary(cart);

  const currency =
    subtotal?.currencyCode ?? total?.currencyCode ?? "USD";
  const format = (amount: number) =>
    formatMoney({ amount: String(amount), currencyCode: currency });

  const subtotalLabel = subtotal ? format(Number(subtotal.amount)) : "—";
  const totalLabel = total ? format(Number(total.amount)) : subtotalLabel;

  const labelClass = compact
    ? "text-[10px] uppercase tracking-[0.2em] text-charcoal/70"
    : "text-sm text-charcoal/70";
  const valueClass = compact
    ? "text-base text-charcoal"
    : "text-lg text-charcoal";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <Row label="Subtotal" value={subtotalLabel} labelClass={labelClass} />
      {discountTotal > 0 && (
        <Row
          label="Promo savings"
          value={`−${format(discountTotal)}`}
          labelClass={labelClass}
          valueClass="text-gold-text"
        />
      )}
      {giftCardTotal > 0 && (
        <Row
          label="Gift card"
          value={`−${format(giftCardTotal)}`}
          labelClass={labelClass}
          valueClass="text-gold-text"
        />
      )}
      {hasAdjustments && (
        <Row
          label={compact ? "Estimated total" : "Total"}
          value={totalLabel}
          labelClass={labelClass}
          valueClass={valueClass}
        />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  labelClass,
  valueClass,
}: {
  label: string;
  value: string;
  labelClass: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={labelClass}>{label}</span>
      <span className={valueClass ?? "text-right text-charcoal"}>{value}</span>
    </div>
  );
}
