import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getJournalArticles } from "@/lib/shopify/journal";
import {
  getAllProductsForCatalog,
  getCollections,
} from "@/lib/shopify/products";
import { bookSections } from "@/lib/book/registry";
import {
  JOURNAL_CATEGORIES,
  collectJournalAuthors,
  collectJournalTags,
} from "@/lib/journal-page";
import { slugify } from "@/lib/feeds/slugs";

/**
 * Evergreen pages have no real revision timestamp. Emitting `new Date()` would
 * tell crawlers every page changed on every deploy, which devalues `lastmod`
 * across the whole sitemap. Bump this when the static copy actually changes.
 */
const STATIC_CONTENT_UPDATED = new Date("2026-09-01T00:00:00.000Z");

function latestDate(dates: Array<string | undefined | null>): Date {
  const times = dates
    .map((value) => (value ? new Date(value).getTime() : Number.NaN))
    .filter((time) => Number.isFinite(time));
  return times.length ? new Date(Math.max(...times)) : STATIC_CONTENT_UPDATED;
}

/**
 * Split sitemap (mirrors Hydrogen's sitemap index: native products/pages/
 * collections sitemaps + a custom editorial child for the journal) — Next.js
 * auto-generates the `/sitemap.xml` index from these ids, each served at
 * `/sitemap/<id>.xml`. NOTE: Next 16 passes `id` to `sitemap()` as a Promise
 * that resolves to a STRING, even though the ids below are declared as strings
 * already — see node_modules/next/dist/docs/.../generate-sitemaps.md.
 */
export async function generateSitemaps() {
  return [
    { id: "pages" },
    { id: "products" },
    { id: "collections" },
    { id: "journal" },
  ];
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const resolvedId = await id;
  switch (resolvedId) {
    case "products":
      return productSitemap();
    case "collections":
      return collectionSitemap();
    case "journal":
      return journalSitemap();
    default:
      return pagesSitemap();
  }
}

async function pagesSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const [products, articles] = await Promise.all([
    getAllProductsForCatalog().catch(() => []),
    getJournalArticles(250).catch(() => []),
  ]);
  const catalogUpdated = latestDate(
    products.map((p) => p.updatedAt ?? p.createdAt),
  );
  const journalUpdated = latestDate(articles.map((a) => a.publishedAt));

  return [
    {
      url: baseUrl,
      lastModified: catalogUpdated,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/heritage`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/craft`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/care-guide`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/concierge`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/pashmina-types`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: catalogUpdated,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: journalUpdated,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/films`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wholesale`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shade-cards`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...bookSections.map((section) => ({
      url: `${baseUrl}/book/${section.slug}`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

async function productSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const products = await getAllProductsForCatalog();
  return products.map((p) => {
    // Google Images is a real discovery channel for a visual catalogue.
    const images = [
      p.featuredImage?.url,
      ...p.images.nodes.map((image) => image.url),
    ].filter((url): url is string => Boolean(url));

    return {
      url: `${baseUrl}/products/${p.handle}`,
      lastModified: new Date(p.updatedAt ?? p.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
      ...(images.length
        ? { images: Array.from(new Set(images)).slice(0, 10) }
        : {}),
    };
  });
}

async function collectionSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const [collections, products] = await Promise.all([
    getCollections(),
    getAllProductsForCatalog().catch(() => []),
  ]);
  const catalogUpdated = latestDate(
    products.map((p) => p.updatedAt ?? p.createdAt),
  );
  return [
    {
      url: `${baseUrl}/collections`,
      lastModified: catalogUpdated,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...collections.map((c) => ({
      url: `${baseUrl}/collections/${c.handle}`,
      lastModified: catalogUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.75,
      ...(c.image?.url ? { images: [c.image.url] } : {}),
    })),
  ];
}

async function journalSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const articles = await getJournalArticles(250);
  const journalUpdated = latestDate(articles.map((a) => a.publishedAt));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/blog/${a.handle}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
    ...(a.image?.url ? { images: [a.image.url] } : {}),
  }));

  // Taxonomy pages are only reachable via in-page links otherwise.
  const taxonomyEntries: MetadataRoute.Sitemap = [
    ...JOURNAL_CATEGORIES.filter((category) => category !== "All").map(
      (category) => ({
        url: `${baseUrl}/blog/category/${slugify(category)}`,
        lastModified: journalUpdated,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }),
    ),
    ...collectJournalTags(articles).map((tag) => ({
      url: `${baseUrl}/blog/tag/${slugify(tag)}`,
      lastModified: journalUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...collectJournalAuthors(articles).map((author) => ({
      url: `${baseUrl}/blog/author/${slugify(author)}`,
      lastModified: journalUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];

  return [...articleEntries, ...taxonomyEntries];
}
