import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import Contact from "@/components/Contact";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
  title: "Contact Us",
  description:
    "Get in touch with The Kashmir Weaver. Inquiries about bespoke Pashmina orders, wholesale, corporate gifting, or visit our workshop in Srinagar, Kashmir.",
  pathname: "/contact",
});

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    image: `${siteConfig.url}/images/brand/the-kashmir-weaver-og.png`,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    priceRange: "$$$",
    currenciesAccepted: "USD, INR",
    paymentAccepted: "Credit Card, Debit Card, UPI, Bank Transfer",
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.linkedin,
      siteConfig.social.googleBusiness,
    ],
    hasMap: siteConfig.address.mapsUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.line1,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "34.0722",
      longitude: "74.7744",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: "34.0722",
        longitude: "74.7744",
      },
      description: "Worldwide shipping from Srinagar, Kashmir",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-8">
        <Contact />
      </div>
    </>
  );
}
