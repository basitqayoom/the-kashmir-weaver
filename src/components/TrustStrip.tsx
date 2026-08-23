const CLAIMS = [
    {
        label: "Authentic Kashmiri Pashmina",
        icon: (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
        ),
    },
    {
        label: "GI-Certified — No. 46",
        icon: (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
        ),
    },
    {
        label: "Free Worldwide Shipping $200+",
        icon: (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v11.177m0-11.177L12.63 4.909a2.25 2.25 0 0 0-1.5-.659H4.5A2.25 2.25 0 0 0 2.25 6.5v7.75" />
            </svg>
        ),
    },
    {
        label: "Handwoven by Master Artisans",
        icon: (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-9L21 12m0 0-4.5 4.5M21 12H7.5" />
            </svg>
        ),
    },
];

/** Compact trust row, ported from the Hydrogen storefront's TrustStrip. */
export default function TrustStrip({ compact = false }: { compact?: boolean } = {}) {
    return (
        <section
            className="border-y"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            aria-label="Why shop with us"
        >
            <ul
                className={`mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-4 px-4 sm:grid-cols-4 sm:gap-8 sm:px-6 lg:px-8 ${compact ? "py-4" : "py-6 sm:py-7"
                    }`}
            >
                {CLAIMS.map((claim) => (
                    <li key={claim.label} className="flex items-center gap-3">
                        <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}
                            aria-hidden="true"
                        >
                            {claim.icon}
                        </span>
                        <p className="text-xs leading-snug sm:text-sm" style={{ color: "var(--foreground)", opacity: 0.85 }}>
                            {claim.label}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
