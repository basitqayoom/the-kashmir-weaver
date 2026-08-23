const CATEGORY_COLORS: Record<string, string> = {
  Heritage: "bg-forest-green text-white",
  Craft: "bg-burgundy text-white",
  Style: "bg-gold text-charcoal",
  Travel: "bg-forest-green text-white",
  Literature: "bg-burgundy text-white",
  "Luxury Living": "bg-gold text-charcoal",
  "Gift Guide": "bg-burgundy text-white",
};

/** Shopify articles carry a `tags` array (often incl. a generic "All" tag) instead of one category field. */
export function articleCategory(tags: string[]): string {
  return tags.find((t) => t.toLowerCase() !== "all") ?? "Journal";
}

export function articleCategoryColor(tags: string[]): string {
  return CATEGORY_COLORS[articleCategory(tags)] ?? "bg-charcoal text-white";
}

export function estimateReadTime(html: string): string {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
