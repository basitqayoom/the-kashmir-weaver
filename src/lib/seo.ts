import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export function canonicalPathname(pathname: string): string {
  const path = pathname.split("?")[0] || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function absoluteUrl(
  pathname: string,
  storeUrl: string = siteConfig.url,
): string {
  const path = canonicalPathname(pathname);
  return `${storeUrl.replace(/\/$/, "")}${path}`;
}

export function absoluteImageUrl(
  image: string | undefined,
  storeUrl: string = siteConfig.url,
): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return absoluteUrl(image, storeUrl);
}

export type SeoBundleOptions = {
  title: string;
  description?: string;
  pathname?: string;
  image?: string;
  images?: Array<
    string | { url: string; width?: number; height?: number; alt?: string }
  >;
  type?: "website" | "article";
  robots?: "noindex";
  publishedTime?: string;
  authors?: string[];
};

/** Consistent metadata for indexable routes — canonical, Open Graph, and Twitter. */
export function seoBundle(options: SeoBundleOptions): Metadata {
  const metadata: Metadata = {
    title: options.title,
    description: options.description,
  };

  if (options.pathname) {
    metadata.alternates = { canonical: canonicalPathname(options.pathname) };
  }

  if (options.robots === "noindex") {
    metadata.robots = { index: false, follow: false };
  }

  const ogImages = options.images?.length
    ? options.images.map((img) =>
        typeof img === "string" ? { url: img } : img,
      )
    : options.image
      ? [{ url: options.image }]
      : undefined;

  metadata.openGraph = {
    title: options.title,
    description: options.description,
    url: options.pathname ? canonicalPathname(options.pathname) : undefined,
    type: options.type ?? "website",
    ...(ogImages ? { images: ogImages } : {}),
    ...(options.type === "article" && options.publishedTime
      ? { publishedTime: options.publishedTime }
      : {}),
    ...(options.type === "article" && options.authors?.length
      ? { authors: options.authors }
      : {}),
  };

  // Twitter falls back to the first Open Graph image so routes that pass
  // `images` (not `image`) still get a large summary card.
  const twitterImage = options.image ?? ogImages?.[0]?.url;

  metadata.twitter = {
    card: "summary_large_image",
    title: options.title,
    description: options.description,
    ...(twitterImage ? { images: [twitterImage] } : {}),
  };

  return metadata;
}

export function itemListLd(options: {
  name: string;
  url: string;
  items: Array<{ name: string; url: string }>;
  storeUrl?: string;
}) {
  const storeUrl = options.storeUrl ?? siteConfig.url;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: options.name,
    url: absoluteUrl(options.url, storeUrl),
    itemListElement: options.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.url, storeUrl),
    })),
  };
}

export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
