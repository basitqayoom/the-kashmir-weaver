import type { JournalArticle } from "@/lib/shopify/journal";

/** Score articles by shared tag overlap — Hydrogen-style related content. */
export function relatedArticlesByTags(
  article: JournalArticle,
  pool: JournalArticle[],
  limit = 3,
): JournalArticle[] {
  const tags = new Set(article.tags.map((t) => t.toLowerCase()));
  if (tags.size === 0) {
    return pool.filter((a) => a.handle !== article.handle).slice(0, limit);
  }

  return pool
    .filter((a) => a.handle !== article.handle)
    .map((a) => {
      const overlap = a.tags.filter((t) => tags.has(t.toLowerCase())).length;
      return { article: a, score: overlap };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.article.publishedAt.localeCompare(a.article.publishedAt))
    .slice(0, limit)
    .map((x) => x.article);
}
