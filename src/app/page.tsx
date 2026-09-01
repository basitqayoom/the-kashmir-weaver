import dynamic from "next/dynamic";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import Navbar from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import HomeShopSection from "@/components/HomeShopSection";
import HomeColourStudio from "@/components/HomeColourStudio";
import Heritage from "@/components/Heritage";
import Stories from "@/components/Stories";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/FabSpeedDial";
import ScrollReveal from "@/components/ScrollReveal";
import ImageModalProvider from "@/components/ImageModal";
import {
  HomeShopSectionSkeleton,
  HomeColourStudioSkeleton,
  StoriesSkeleton,
} from "@/components/HomeSectionSkeletons";

const FAQ = dynamic(() => import("@/components/FAQ"));

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
  sameAs: [siteConfig.social.instagram, siteConfig.social.linkedin],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/logo/logo-green-bg.png`,
  sameAs: [siteConfig.social.instagram, siteConfig.social.linkedin],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Navbar overlay />
      <main id="main-content">
        <Hero />
        <Suspense fallback={<HomeShopSectionSkeleton />}>
          <HomeShopSection />
        </Suspense>
        <Suspense fallback={<HomeColourStudioSkeleton />}>
          <HomeColourStudio />
        </Suspense>
        <Heritage />
        <Suspense fallback={<StoriesSkeleton />}>
          <Stories />
        </Suspense>
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFAB />
      <ScrollReveal />
    </ImageModalProvider>
  );
}
