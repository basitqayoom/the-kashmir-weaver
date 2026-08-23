import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import EditorialCTA from "@/components/EditorialCTA";
import { siteConfig, whatsappLink } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Wholesale & Corporate Gifting",
    description:
        "Wholesale Kashmiri Pashmina for boutiques, corporate gifting, and bulk custom orders — GI-certified, direct from Kashmir artisans, private-label and branding options available.",
    pathname: "/wholesale",
});

const benefits = [
    {
        title: "GI-Certified Sourcing",
        body: "Every piece is verifiably handwoven Kashmiri Pashmina — a genuine provenance story your customers or recipients can trust.",
    },
    {
        title: "Direct-From-Artisan Pricing",
        body: "No middlemen. Wholesale pricing reflects direct-from-loom sourcing, passed on transparently at volume.",
    },
    {
        title: "Private Label & Custom Branding",
        body: "Branded packaging, custom care labels, and bespoke colourways available for boutique partners and corporate orders.",
    },
    {
        title: "Flexible Minimum Order Quantities",
        body: "From boutique trial orders to large corporate gifting runs — tell us your volume and we'll structure pricing accordingly.",
    },
    {
        title: "Sample Program",
        body: "Request physical samples before committing to a bulk order, so your team can verify quality firsthand.",
    },
    {
        title: "Worldwide Shipping",
        body: "Consolidated freight for large orders, or individually dropshipped gifting — we handle logistics either way.",
    },
];

const steps = [
    { step: "01", title: "Inquire", body: "Share your volume, budget, and timeline using the form below." },
    { step: "02", title: "Sample", body: "We send physical samples matching your requirements for approval." },
    { step: "03", title: "Order", body: "Confirm quantities, customization, and delivery schedule." },
    { step: "04", title: "Ship", body: "Your order is woven, quality-checked, and shipped worldwide." },
];

export default function WholesalePage() {
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Wholesale & Corporate Gifting", item: `${siteConfig.url}/wholesale` },
        ],
    };

    return (
        <main id="main-content" className="bg-ivory">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <section className="bg-paper-alt pb-16 pt-28 sm:pt-32">
                <div className="reveal mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
                        The Kashmir Weaver &middot; Trade
                    </p>
                    <h1 className="mt-4 font-heading text-4xl font-light text-charcoal sm:text-5xl">
                        Wholesale &amp; Corporate Gifting
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-charcoal/70">
                        Partner with us for boutique retail, bulk custom orders, or corporate
                        gifting programs — GI-certified Kashmiri Pashmina, sourced direct
                        from artisan looms, with private-label and branding options for
                        qualifying volumes.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="reveal grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((b) => (
                        <div key={b.title} className="border border-charcoal/10 bg-paper-alt p-6">
                            <h2 className="font-heading text-lg font-semibold text-charcoal">{b.title}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{b.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-paper-alt py-16">
                <div className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center font-heading text-3xl font-bold text-charcoal sm:text-4xl">
                        How It Works
                    </h2>
                    <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((s) => (
                            <div key={s.step} className="text-center">
                                <p className="font-heading text-3xl font-bold text-gold-text">{s.step}</p>
                                <h3 className="mt-2 font-heading text-base font-semibold text-charcoal">{s.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-charcoal/70">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="reveal text-center">
                    <h2 className="font-heading text-3xl font-bold text-charcoal sm:text-4xl">
                        Start Your Wholesale Inquiry
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-charcoal/70">
                        Fill out the form below, or message us directly on{" "}
                        <a
                            href={whatsappLink(siteConfig.whatsappMessages.default)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-whatsapp underline hover:text-whatsapp/80"
                        >
                            WhatsApp
                        </a>{" "}
                        for a faster response.
                    </p>
                </div>
                <div className="reveal mt-10 border border-gold/10 bg-white/80 p-6 sm:p-8">
                    <ContactForm defaultInquiryType="Wholesale Order" />
                </div>
            </section>
            <EditorialCTA
                eyebrow="Retail"
                title="Explore the full collection"
                description="Wholesale partners often start with a single piece — browse the atelier catalog anytime."
                href="/shop"
                ctaLabel="Shop the Collection"
            />
        </main>
    );
}
