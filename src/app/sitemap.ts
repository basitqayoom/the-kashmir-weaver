import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getJournalArticles } from "@/lib/shopify/journal";
import {
  getAllProductsForCatalog,
  getCollections,
} from "@/lib/shopify/products";
import { bookSections } from "@/lib/book/registry";

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

function pagesSitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/heritage`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/craft`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/care-guide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/concierge`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/pashmina-types`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/films`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wholesale`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shade-cards`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...bookSections.map((section) => ({
      url: `${baseUrl}/book/${section.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

async function productSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const products = await getAllProductsForCatalog();
  return products.map((p) => ({
    url: `${baseUrl}/products/${p.handle}`,
    lastModified: new Date(p.updatedAt ?? p.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}

async function collectionSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const collections = await getCollections();
  return [
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...collections.map((c) => ({
      url: `${baseUrl}/collections/${c.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];
}

async function journalSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const articles = await getJournalArticles(250);
  return articles.map((a) => ({
    url: `${baseUrl}/blog/${a.handle}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}
