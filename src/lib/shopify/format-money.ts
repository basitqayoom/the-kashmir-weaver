export function formatMoney(money: {
  amount: string;
  currencyCode: string;
}): string {
  const amount = Number(money.amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
