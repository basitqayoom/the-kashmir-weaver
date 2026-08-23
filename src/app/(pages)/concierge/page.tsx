import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ConciergeForm from "@/components/ConciergeForm";
import EditorialCTA from "@/components/EditorialCTA";
import { siteConfig } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Concierge — The Kashmir Weaver",
    description: "Private inquiries, bespoke commissions, and atelier appointments.",
    pathname: "/concierge",
});

export default function ConciergePage() {
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Concierge", item: `${siteConfig.url}/concierge` },
        ],
    };

    return (
        <main id="main-content" className="bg-ivory">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
            />
            <PageHero
                eyebrow="The Kashmir Weaver · Concierge"
                title={
                    <>
                        Private Inquiries,
                        <br />
                        <span className="italic">Personally Handled</span>
                    </>
                }
                description="Bespoke commissions, wholesale and corporate gifting, boutique partnerships, and atelier appointments — tell us what you need and our concierge team will guide you personally."
            />
            <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <ConciergeForm />
                </div>
            </section>
            <EditorialCTA />
        </main>
    );
}
