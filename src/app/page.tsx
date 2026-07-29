import dynamic from "next/dynamic";
import { siteConfig } from "@/config/site";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MarqueeStrip from "@/components/MarqueeStrip";
import Heritage from "@/components/Heritage";
import WhyUs from "@/components/WhyUs";
import StatsStrip from "@/components/StatsStrip";
import Authenticity from "@/components/Authenticity";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import ScrollReveal from "@/components/ScrollReveal";
import ImageModalProvider from "@/components/ImageModal";

const CraftProcess = dynamic(() => import("@/components/CraftProcess"));
const ShawlShowcase = dynamic(() => import("@/components/ShawlShowcase"));
const FilmsTeaser = dynamic(() => import("@/components/FilmsTeaser"));
const DiscoverCTA = dynamic(() => import("@/components/DiscoverCTA"));
const Services = dynamic(() => import("@/components/Services"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const Stories = dynamic(() => import("@/components/Stories"));
const FAQ = dynamic(() => import("@/components/FAQ"));
const Contact = dynamic(() => import("@/components/Contact"));
const CookieBanner = dynamic(() => import("@/components/CookieBanner"));

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/logo/logo-green-bg.png`,
  image: `${siteConfig.url}/images/logo/logo-green-bg.png`,
  description: siteConfig.description,
  telephone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.line1,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.address.geo.latitude,
    longitude: siteConfig.address.geo.longitude,
  },
  sameAs: [siteConfig.social.instagram, siteConfig.social.linkedin],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between Pashmina and Cashmere?",
      acceptedAnswer: {
        "@type": "Answer",
        text: 'Both come from goats, and the word "cashmere" derives from "Kashmir." True Pashmina uses fibre from the Changthangi goat of Ladakh, measuring 12–16 microns — significantly finer than commercial cashmere (18–22 microns). Pashmina is hand-spun and hand-woven; most cashmere is machine-processed. The result: Pashmina is warmer, softer, lighter, and lasts decades longer.',
      },
    },
    {
      "@type": "Question",
      name: "How do I know if a Pashmina shawl is genuine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: 'The only reliable proof is the GI mark — Geographical Indication No. 46, issued by the Government of India after lab testing at PTQCC in Srinagar. The popular "ring test" is a myth — many synthetics pass it. A burn test can confirm natural fibre, but only GI certification confirms it is specifically Changthangi Pashm. Every Kashmir Weaver piece carries this mark.',
      },
    },
    {
      "@type": "Question",
      name: "How is a Pashmina shawl made?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Over 20 hand processes: the fibre is hand-combed from Changthangi goats in Ladakh, dehaired, hand-spun, hand-dyed, and hand-woven on a wooden Saaz loom. After weaving, the shawl is washed in spring water and struck against river stones for softness. If embroidered, months or years of additional needlework follow. Zero machines at any stage.",
      },
    },
    {
      "@type": "Question",
      name: "Why is Pashmina so expensive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rarity and craft time. Each goat yields only 80–170g of raw fibre per year. A single shawl requires months of hand-processing. Kani weaving takes 12–18 months. Sozni embroidery takes 7–10 years to learn. Fewer than 900 active Kani weavers remain worldwide. You are paying for irreplaceable human skill and centuries of tradition.",
      },
    },
    {
      "@type": "Question",
      name: "What sizes are available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stole: 70×200cm · Shawl: 100×200cm · Large Square: 137×137cm · Oversized Wrap: 100×250–300cm. Custom sizes are available for bespoke orders.",
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
      name: "How do I care for a Pashmina shawl?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dry clean for best results. If hand washing: use lukewarm water with mild detergent, never wring or twist. Lay flat to dry away from direct sunlight. Store folded in breathable fabric with cedar or lavender. Pashmina actually improves with age — it gets softer over decades.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer custom/bespoke orders?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Custom embroidery designs, colour selection, sizing, private labelling, and wedding/event orders are all available. Lead times: plain 4–6 weeks, embroidered 8–16 weeks, Kani up to 6 months.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Executive Heritage Box?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A handcrafted walnut-wood case lined with silk, containing the shawl, GI certificate of authenticity, artisan story card, and (for corporate orders) custom branding and personalised messaging. It transforms a gift into an experience.",
      },
    },
    {
      "@type": "Question",
      name: "How do I place an order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Three ways: browse our latest collection on Instagram (@thekashmirweaver), message us on WhatsApp (+91 979 610 5623), or fill out the inquiry form below. We'll guide you personally through selection, sizing, and customisation.",
      },
    },
  ],
};

export default function Home() {
  return (
    <ImageModalProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main id="main-content">
        <Hero />
        <MarqueeStrip />
        <Heritage />
        <WhyUs />
        <StatsStrip />
        <Authenticity />
        <CraftProcess />
        <ShawlShowcase />
        <FilmsTeaser />
        <DiscoverCTA />
        <Services />
        <Testimonials />
        <Stories />
        <FAQ />
        <Contact />
        <MarqueeStrip />
      </main>
      <Footer />
      <WhatsAppFAB />
      <CookieBanner />
      <ScrollReveal />
    </ImageModalProvider>
  );
}
