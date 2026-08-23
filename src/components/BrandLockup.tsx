import Image from "next/image";

/**
 * Two-line typographic brand lockup — mirrors Hydrogen's BrandLockup markup
 * pattern (serif line + tracked accent line), styled with this site's own
 * Snow & Saffron tokens/fonts rather than Hydrogen's palette.
 */
export function BrandLockup({
    className = "",
    tone = "dark",
}: {
    className?: string;
    /** "dark" = charcoal text for light backgrounds; "light" = ivory text for dark backgrounds (footer). */
    tone?: "dark" | "light";
}) {
    return (
        <span
            className={`font-heading flex flex-col uppercase leading-[1.1] font-semibold ${tone === "light" ? "text-ivory" : "text-charcoal"
                } ${className}`}
        >
            <span
                className={`whitespace-nowrap${tone === "light" ? "" : " text-charcoal"}`}
            >
                The Kashmir
            </span>
            <span
                className={`font-accent mt-0.5 whitespace-nowrap text-[0.62em] font-semibold not-italic tracking-[0.42em] ${tone === "light" ? "text-gold" : "text-gold-text"
                    }`}
            >
                Weaver
            </span>
        </span>
    );
}

/** Loom-knot emblem — copied from hydrogen-the-kashmir-weaver/app/assets/brand-mark*.png. Size via className (e.g. "h-8 w-8"). */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
    return (
        <span className={`relative inline-block shrink-0 ${className}`}>
            <Image
                src="/images/brand/brand-mark.png"
                alt=""
                aria-hidden="true"
                fill
                sizes="64px"
                className="object-contain"
            />
        </span>
    );
}

export default BrandLockup;
