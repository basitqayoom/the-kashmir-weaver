import { siteConfig } from "@/config/site";
import { slugEquals } from "./slugs";
import type { FeedChannel, FeedItem } from "./types";

export type JournalFilterKind = "category" | "tag" | "author";

/** Category and tag both filter on the same Shopify article tags — Hydrogen exposes them as
 * two separate URL prefixes for flexibility/SEO, but the matching logic is identical. */
export function filterJournalFeedByCategory(
  items: FeedItem[],
  category: string,
): FeedItem[] {
  return items.filter((item) =>
    item.categories.some((cat) => slugEquals(cat, category)),
  );
}

export function filterJournalFeedByTag(
  items: FeedItem[],
  tag: string,
): FeedItem[] {
  return items.filter((item) =>
    item.categories.some((cat) => slugEquals(cat, tag)),
  );
}

export function filterJournalFeedByAuthor(
  items: FeedItem[],
  author: string,
): FeedItem[] {
  return items.filter((item) => slugEquals(item.author, author));
}

export function filterJournalFeedItems(
  items: FeedItem[],
  kind: JournalFilterKind,
  param: string,
): FeedItem[] {
  if (kind === "category") return filterJournalFeedByCategory(items, param);
  if (kind === "tag") return filterJournalFeedByTag(items, param);
  return filterJournalFeedByAuthor(items, param);
}

export function filteredJournalFeedChannel(
  kind: JournalFilterKind,
  param: string,
  format: "rss" | "atom",
): FeedChannel {
  const label =
    kind === "category"
      ? `Category: ${param}`
      : kind === "tag"
        ? `Tag: ${param}`
        : `Author: ${param}`;
  const path = `/blog/${kind}/${encodeURIComponent(param)}`;
  return {
    title: `${siteConfig.name} — Journal — ${label}`,
    link: `${siteConfig.url}${path}`,
    description: siteConfig.description,
    selfUrl: `${siteConfig.url}${path}/${format === "rss" ? "rss.xml" : "atom.xml"}`,
    language: "en",
  };
}
