import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Cormorant_Garamond, Lora, Josefin_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { DisplayCurrencyProvider } from "@/lib/display-currency";
import MotionReady from "@/components/MotionReady";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MetaPixel from "@/components/MetaPixel";
import ConsentGatedAnalytics from "@/components/ConsentGatedAnalytics";
import "./globals.css";

const CookieBanner = dynamic(() => import("@/components/CookieBanner"));

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: `%s | ${siteConfig.name}`,
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
  },
  description: siteConfig.description,
  keywords:
    "Kashmiri Pashmina, GI certified shawl, handwoven pashmina, Kashmir shawl, corporate gifting, wholesale pashmina, luxury shawl, Kani weave, Sozni embroidery, pashmina shawl price, buy pashmina online, authentic pashmina",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    title: `${siteConfig.name} | Authentic Handwoven Kashmiri Pashmina`,
    description:
      "GI-certified luxury Pashmina shawls — from the looms of Kashmir to the world.",
    url: "/",
    images: [
      {
        url: "/images/logo/logo-green-bg.png",
        width: 1200,
        height: 630,
        alt: "The Kashmir Weaver — Authentic GI-Certified Kashmiri Pashmina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Authentic Handwoven Kashmiri Pashmina`,
    description:
      "GI-certified luxury Pashmina shawls — from the looms of Kashmir to the world.",
    images: ["/images/logo/logo-green-bg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/blog/rss.xml", title: "The Kashmir Weaver Blog" },
        { url: "/products/rss.xml", title: "The Kashmir Weaver Products" },
      ],
      "application/atom+xml": [
        { url: "/blog/atom.xml", title: "The Kashmir Weaver Blog (Atom)" },
        { url: "/products/atom.xml", title: "The Kashmir Weaver Products (Atom)" },
      ],
    },
  },
  verification: {
    google: siteConfig.verification.google,
    other: {
      "p:domain_verify": siteConfig.verification.pinterest,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lora.variable} ${josefin.variable}`}>
      <body className="antialiased">
        <MotionReady />
        <WebVitalsReporter />
        <DisplayCurrencyProvider>
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          {children}
        </DisplayCurrencyProvider>
        <ConsentGatedAnalytics />
        <GoogleAnalytics />
        <MetaPixel />
        <CookieBanner />
      </body>
    </html>
  );
}
