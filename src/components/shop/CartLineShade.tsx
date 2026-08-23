import ShadeSwatch from "./ShadeSwatch";
import { formatShadeCartLabel, parseShadeFromCartAttributes } from "@/lib/shopify/shade-cart";

/** Small "Colour: X (code)" badge rendered under a cart line's variant options. */
export default function CartLineShade({
    attributes,
    className = "text-xs text-charcoal/70",
}: {
    attributes?: Array<{ key?: string | null; value?: string | null } | null> | null;
    className?: string;
}) {
    const parsed = parseShadeFromCartAttributes(attributes);
    const label = formatShadeCartLabel(attributes);
    if (!label) return null;

    return (
        <div className={`flex items-start gap-1.5 ${className}`}>
            <span className="min-w-0 break-words">Colour: {label}</span>
            {parsed?.hex && (
                <ShadeSwatch
                    hex={parsed.hex}
                    size="sm"
                    label={label}
                    className="mt-0.5"
                />
            )}
        </div>
    );
}
