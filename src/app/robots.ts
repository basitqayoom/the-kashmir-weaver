import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /cart and /search rely on noindex meta instead, so they stay crawlable.
      disallow: ["/api/", "/_next/", "/account/", "/cart/", "/discount/"],
    },
    // Index first, then children. /sitemap/editorial.xml is intentionally not
    // listed — it duplicates URLs the native sitemaps already cover.
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap/pages.xml`,
      `${siteConfig.url}/sitemap/products.xml`,
      `${siteConfig.url}/sitemap/collections.xml`,
      `${siteConfig.url}/sitemap/journal.xml`,
    ],
  };
}
