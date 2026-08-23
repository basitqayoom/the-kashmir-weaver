import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { siteConfig } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Care Guide — The Kashmir Weaver",
    description:
        "How to wash, dry, and store a genuine Pashmina shawl so it lasts thirty years and beyond.",
    pathname: "/care-guide",
});

const sections = [
    {
        title: "Washing",
        body: "Use lukewarm water and a very small amount of mild detergent — baby shampoo works perfectly. Submerge the shawl, press it gently through the water a few times, and let it soak for five minutes, then rinse in clean lukewarm water until it runs clear. Never use hot water, never wring or twist the fabric, and never put it in a washing machine — machine agitation is the single fastest way to ruin Pashmina.",
    },
    {
        title: "Drying",
        body: "Lay the shawl flat on a clean, dry towel. Roll the towel gently to press out excess moisture, then unroll and lay the shawl flat on a fresh towel to air dry, away from direct sunlight and heat. Never hang a wet Pashmina — the weight of the water will pull the fibres out of shape.",
    },
    {
        title: "Storing",
        body: "Fold your shawl and store it in a breathable fabric bag — cotton or muslin. A small cedar block deters moths naturally. Avoid plastic bags, which trap moisture and can encourage mildew over time.",
    },
    {
        title: "Pilling",
        body: "Small bobbles may form on the surface during the first months of wear — this is completely normal with genuine natural fibre, not a sign of low quality. Use a fine cashmere comb to gently remove them; pilling diminishes with time as the surface smooths.",
    },
    {
        title: "Embroidered Pieces",
        body: "For heavily embroidered pieces — Jamawar, Sozni, or metallic Tilla work — we recommend professional dry cleaning rather than hand washing, since the embroidery threads and base fabric can respond differently to water.",
    },
];

export default function CareGuidePage() {
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Care Guide", item: `${siteConfig.url}/care-guide` },
        ],
    };

    return (
        <main id="main-content" className="bg-ivory">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
            />
            <PageHero
                eyebrow="The Kashmir Weaver · Care Guide"
                title={
                    <>
                        Thirty Years,
                        <br />
                        <span className="italic">If You Treat It Right</span>
                    </>
                }
                description="A well-made Pashmina is not fragile — it rewards gentle treatment with remarkable longevity. Here is how to keep yours beautiful for decades."
            />
            <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="reveal space-y-12">
                        {sections.map((s) => (
                            <div key={s.title}>
                                <h2 className="font-heading text-2xl font-bold text-charcoal sm:text-3xl">{s.title}</h2>
                                <p className="mt-3 text-base leading-relaxed text-charcoal/70">{s.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="reveal mt-16 border-t border-charcoal/10 pt-10 text-center">
                        <p className="font-heading text-lg italic text-charcoal/70">
                            &ldquo;We hear regularly from customers whose mothers or grandmothers passed shawls down to
                            them — pieces that are now more beautiful than ever. Time is Pashmina&rsquo;s friend.&rdquo;
                        </p>
                        <Link
                            href="/shop"
                            className="font-accent mt-8 inline-flex bg-gold px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-all hover:bg-gold-dark"
                        >
                            Shop the Collection
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
