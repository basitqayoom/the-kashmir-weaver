import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import EditorialCTA from "@/components/EditorialCTA";
import { siteConfig } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Disclaimer — The Kashmir Weaver",
    description: "Important notes on colour accuracy, natural fibre variation, and handwoven craftsmanship.",
    pathname: "/disclaimer",
});

export default function DisclaimerPage() {
    return (
        <main id="main-content" className="bg-ivory">
            <PageHero eyebrow="The Kashmir Weaver · Disclaimer" title="Disclaimer" />
            <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-3xl space-y-8 px-4 text-base leading-relaxed text-charcoal/70 sm:px-6 lg:px-8">
                    <div>
                        <h2 className="font-heading text-xl font-bold text-charcoal">Handwoven Variation</h2>
                        <p className="mt-3">
                            Every {siteConfig.name} piece is handwoven and, where applicable, hand-dyed by individual
                            artisans. Small variations in weave density, drape, fringe length, and colour depth between
                            pieces of the same design are a natural signature of handmade work, not a defect.
                        </p>
                    </div>
                    <div>
                        <h2 className="font-heading text-xl font-bold text-charcoal">Colour Accuracy</h2>
                        <p className="mt-3">
                            We photograph every piece under consistent, natural-toned lighting, but screen calibration
                            varies by device. Actual shade may differ slightly from what you see on screen. Where a
                            colour-preview tool is offered on a product page, it is a styling guide only — the finished,
                            hand-dyed piece may vary slightly from the on-screen preview.
                        </p>
                    </div>
                    <div>
                        <h2 className="font-heading text-xl font-bold text-charcoal">Care &amp; Longevity</h2>
                        <p className="mt-3">
                            Guidance provided in our{" "}
                            <a href="/care-guide" className="text-gold-text underline underline-offset-2">
                                Care Guide
                            </a>{" "}
                            reflects standard practice for genuine Pashmina but cannot account for every environment or
                            usage pattern. We are not responsible for damage resulting from care methods outside this
                            guidance.
                        </p>
                    </div>
                    <div>
                        <h2 className="font-heading text-xl font-bold text-charcoal">Pricing &amp; Availability</h2>
                        <p className="mt-3">
                            Prices, availability, and lead times are subject to change without notice, particularly for
                            limited-edition and bespoke pieces. Custom and made-to-order commissions are confirmed
                            individually with the customer before production begins.
                        </p>
                    </div>
                    <p className="text-sm text-charcoal/70">
                        For questions about a specific order, please reach our{" "}
                        <a href="/concierge" className="text-gold-text underline underline-offset-2">
                            Concierge team
                        </a>
                        .
                    </p>
                </div>
            </section>
            <EditorialCTA />
        </main>
    );
}
