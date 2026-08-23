import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Heritage from "@/components/Heritage";
import StatsStrip from "@/components/StatsStrip";
import EditorialCTA from "@/components/EditorialCTA";
import { siteConfig } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Our Heritage — The Kashmir Weaver",
    description:
        "Six centuries of Kashmiri weaving tradition — the Wovur, the wooden Saaz loom, and the hands that keep this craft alive today.",
    pathname: "/heritage",
});

export default function HeritagePage() {
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Our Heritage", item: `${siteConfig.url}/heritage` },
        ],
    };

    return (
        <main id="main-content" className="bg-ivory">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
            />
            <PageHero
                eyebrow="The Kashmir Weaver · Heritage"
                title={
                    <>
                        Six Centuries of Craft,
                        <br />
                        <span className="italic">Woven by Hand</span>
                    </>
                }
                description="A tradition older than the Mughal Empire, still alive today in the hands of Srinagar's master weavers."
            />
            <Heritage />
            <StatsStrip />
            <EditorialCTA
                title="Experience the craft"
                description="From the Himalayas to your hands — discover every piece born of this unbroken thread."
            />
        </main>
    );
}
