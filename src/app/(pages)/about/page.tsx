import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import WhyUs from "@/components/WhyUs";
import Authenticity from "@/components/Authenticity";
import EditorialCTA from "@/components/EditorialCTA";
import { siteConfig } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "About Us — The Kashmir Weaver",
    description:
        "GI-certified, ethically sourced Pashmina direct from Kashmir's artisan weavers — who we are and why it matters.",
    pathname: "/about",
});

export default function AboutPage() {
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "About", item: `${siteConfig.url}/about` },
        ],
    };

    return (
        <main id="main-content" className="bg-ivory">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
            />
            <PageHero
                eyebrow="The Kashmir Weaver · About"
                title={
                    <>
                        Direct from the Artisans,
                        <br />
                        <span className="italic">Nothing in Between</span>
                    </>
                }
                description="We work directly with Kashmiri weaving families — no middlemen, no mass production. Every piece is GI-certified and traceable to the hands that made it."
            />
            <WhyUs />
            <Authenticity />
            <EditorialCTA />
        </main>
    );
}
