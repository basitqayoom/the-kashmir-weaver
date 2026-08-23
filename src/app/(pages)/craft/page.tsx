import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CraftProcess from "@/components/CraftProcess";
import EditorialCTA from "@/components/EditorialCTA";
import { siteConfig } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "The Craft — The Kashmir Weaver",
    description:
        "From raw Changthangi fibre to a finished shawl — over 20 hand processes, zero machines, and the artisans who carry each step.",
    pathname: "/craft",
});

export default function CraftPage() {
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "The Craft", item: `${siteConfig.url}/craft` },
        ],
    };

    return (
        <main id="main-content" className="bg-ivory">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
            />
            <PageHero
                eyebrow="The Kashmir Weaver · The Craft"
                title={
                    <>
                        Every Thread,
                        <br />
                        <span className="italic">By Hand</span>
                    </>
                }
                description="Over 20 hand processes separate a genuine Pashmina from an imitation — from fibre to finished shawl, zero machines touch the work."
            />
            <CraftProcess />
            <EditorialCTA />
        </main>
    );
}
