import { siteConfig } from "@/config/site";
import { getJournalArticles } from "@/lib/shopify/journal";
import { bookSections } from "@/lib/book/registry";

const EDITORIAL_PATHS = [
  "/",
  // NOTE: /collections/all is deliberately excluded — it permanently redirects to /shop,
  // and sitemaps must only list final, 200-status canonical URLs.
  "/collections",
  "/shop",
  "/about",
  "/heritage",
  "/craft",
  "/faq",
  "/care-guide",
  "/shade-cards",
  "/concierge",
  "/book",
  "/blog",
  "/films",
  "/wholesale",
  "/pashmina-types",
  "/terms",
  "/privacy",
  "/shipping",
  "/returns",
  "/disclaimer",
];

type SitemapEntry = {
  loc: string;
  lastmod: string;
  priority: string;
  image?: string;
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function priorityFor(pathname: string): string {
  if (pathname === "/") return "1.0";
  if (pathname.startsWith("/blog/")) return "0.6";
  return "0.7";
}

function entryToXml(entry: SitemapEntry): string {
  const parts: string[] = [`    <loc>${xmlEscape(entry.loc)}</loc>`];
  parts.push(`    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>`);
  parts.push("    <changefreq>weekly</changefreq>");
  parts.push(`    <priority>${entry.priority}</priority>`);
  if (entry.image) {
    parts.push(
      `    <image:image>\n      <image:loc>${xmlEscape(entry.image)}</image:loc>\n    </image:image>`,
    );
  }
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

export async function GET() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const lastmod = new Date().toISOString().split("T")[0];
  const articles = await getJournalArticles(250);

  const staticEntries: SitemapEntry[] = EDITORIAL_PATHS.map((pathname) => ({
    loc: `${baseUrl}${pathname}`,
    lastmod,
    priority: priorityFor(pathname),
  }));

  const bookEntries: SitemapEntry[] = bookSections.map((section) => ({
    loc: `${baseUrl}/book/${section.slug}`,
    lastmod,
    priority: "0.6",
  }));

  const journalEntries: SitemapEntry[] = articles.map((article) => {
    const published = new Date(article.publishedAt).toISOString().split("T")[0];
    return {
      loc: `${baseUrl}/blog/${article.handle}`,
      lastmod: published,
      priority: priorityFor(`/blog/${article.handle}`),
      image: article.image?.url,
    };
  });

  const entries = [...staticEntries, ...bookEntries, ...journalEntries];
  const urls = entries.map((entry) => entryToXml(entry)).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": `public, max-age=${60 * 60 * 12}`,
    },
  });
}
