const PAYMENT_ICONS_CDN = "https://cdn.shopify.com/shopifycloud/storefront/assets/payment_icons";

/** Shopify's own hosted payment-method icons — same assets Liquid themes use. */
const METHODS = [
    { type: "visa", label: "Visa", file: "visa-b614b878.svg" },
    { type: "master", label: "Mastercard", file: "master-f5a74105.svg" },
    { type: "american_express", label: "American Express", file: "american_express-2bdbf0e2.svg" },
    { type: "upi", label: "UPI", file: "upi-470cacf4.svg" },
    { type: "shopify_pay", label: "Shop Pay", file: "shopify_pay-925ab76d.svg" },
] as const;

export default function PaymentMethods({ className = "" }: { className?: string } = {}) {
    return (
        <ul className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Accepted payment methods">
            {METHODS.map((method) => (
                <li key={method.type} className="flex items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`${PAYMENT_ICONS_CDN}/${method.file}`}
                        alt={method.label}
                        width={38}
                        height={24}
                        loading="lazy"
                        decoding="async"
                        className="h-6 w-auto"
                    />
                </li>
            ))}
        </ul>
    );
}
