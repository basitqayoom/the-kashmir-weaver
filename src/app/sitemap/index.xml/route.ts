import { siteConfig } from "@/config/site";

const CHILD_SITEMAPS = [
  "/sitemap/pages.xml",
  "/sitemap/products.xml",
  "/sitemap/collections.xml",
  "/sitemap/journal.xml",
];

export const revalidate = 3600;

/**
 * `generateSitemaps()` in src/app/sitemap.ts only emits the child sitemaps at
 * `/sitemap/<id>.xml` — Next never produces the index itself, so `/sitemap.xml`
 * (advertised in robots.txt and submitted to Search Console) would 404.
 * next.config.ts rewrites `/sitemap.xml` here.
 */
export async function GET() {
  const lastmod = new Date().toISOString();
  const entries = CHILD_SITEMAPS.map(
    (path) =>
      `<sitemap><loc>${siteConfig.url}${path}</loc><lastmod>${lastmod}</lastmod></sitemap>`,
  ).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
