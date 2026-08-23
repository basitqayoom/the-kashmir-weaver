import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
    // Split sitemap (see src/app/sitemap.ts generateSitemaps) — Next.js doesn't
    // auto-generate an index at a plain /sitemap.xml when generateSitemaps is
    // used, so each child sitemap is listed directly (robots.txt supports
    // multiple Sitemap: lines natively).
    sitemap: [
      `${siteConfig.url}/sitemap/pages.xml`,
      `${siteConfig.url}/sitemap/products.xml`,
      `${siteConfig.url}/sitemap/collections.xml`,
      `${siteConfig.url}/sitemap/journal.xml`,
      `${siteConfig.url}/sitemap/editorial.xml`,
    ],
  };
}
