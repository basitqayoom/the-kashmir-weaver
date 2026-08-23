import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FAQ from "@/components/FAQ";
import EditorialCTA from "@/components/EditorialCTA";
import { siteConfig } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Frequently Asked Questions — The Kashmir Weaver",
    description:
        "Pashmina vs cashmere, GI certification, sizing, care, shipping, and bespoke orders — everything you need to know before you buy.",
    pathname: "/faq",
});

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "What is the difference between Pashmina and Cashmere?",
            acceptedAnswer: {
                "@type": "Answer",
                text: 'Both come from goats, and the word "cashmere" derives from "Kashmir." True Pashmina uses fibre from the Changthangi goat of Ladakh, measuring 12–16 microns — significantly finer than commercial cashmere (18–22 microns). Pashmina is hand-spun and hand-woven; most cashmere is machine-processed.',
            },
        },
        {
            "@type": "Question",
            name: "How do I know if a Pashmina shawl is genuine?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "The only reliable proof is the GI mark — Geographical Indication No. 46, issued by the Government of India after lab testing at PTQCC in Srinagar. Every Kashmir Weaver piece carries this mark.",
            },
        },
        {
            "@type": "Question",
            name: "Do you ship internationally?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. We ship worldwide — USA, UK, Canada, Europe, UAE, Australia, and more. All shipments are tracked and insured.",
            },
        },
        {
            "@type": "Question",
            name: "Do you offer custom/bespoke orders?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Absolutely. Custom embroidery designs, colour selection, sizing, private labelling, and wedding/event orders are all available.",
            },
        },
    ],
};

export default function FAQPage() {
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "FAQ", item: `${siteConfig.url}/faq` },
        ],
    };

    return (
        <main id="main-content" className="bg-ivory">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
            />
            <PageHero
                eyebrow="The Kashmir Weaver · FAQ"
                title={
                    <>
                        Questions,
                        <br />
                        <span className="italic">Answered</span>
                    </>
                }
                description="Everything you need to know about authenticity, sizing, care, shipping, and bespoke commissions."
            />
            <FAQ />
            <EditorialCTA />
        </main>
    );
}
