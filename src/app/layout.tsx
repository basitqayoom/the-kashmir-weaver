import type { Metadata } from "next";
import { Cormorant_Garamond, Lora, Josefin_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/config/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
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
    languages: {
      "x-default": "https://thekashmirweaver.com",
      "en-IN": "https://thekashmirweaver.in",
    },
  },
  verification: {
    google: "Z1IoiWticf5Ho_AAlEmWW1G-eA4niLGaphHfO3EOO10",
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
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
