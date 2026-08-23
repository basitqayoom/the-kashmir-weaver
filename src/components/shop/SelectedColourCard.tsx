import type { Shade } from "@/lib/shopify/shades";
import ShadeSwatch from "./ShadeSwatch";

export default function SelectedColourCard({
    shade,
    label = "Selected colour",
    compact = false,
}: {
    shade: Shade;
    label?: string;
    compact?: boolean;
}) {
    return (
        <div
            className={`flex w-full items-center justify-between gap-3 border border-charcoal/15 ${compact ? "px-3 py-2" : "px-4 py-3"
                }`}
        >
            <div className="min-w-0">
                <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70">{label}</p>
                <p className="truncate text-sm tracking-wide text-charcoal">
                    {shade.code} · {shade.family}
                </p>
                {!compact && (
                    <p className="font-accent text-[10px] uppercase tracking-[0.15em] text-charcoal/70">{shade.hex}</p>
                )}
            </div>
            <ShadeSwatch hex={shade.hex} size={compact ? "md" : "lg"} label={`${shade.code} · ${shade.family}`} />
        </div>
    );
}
