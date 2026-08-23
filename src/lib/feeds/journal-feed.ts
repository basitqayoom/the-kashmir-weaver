import type { JournalArticle } from "@/lib/shopify/journal";
import { siteConfig } from "@/config/site";
import type { FeedChannel, FeedItem } from "./types";

export function journalArticlesToFeedItems(
  articles: JournalArticle[],
): FeedItem[] {
  return articles.map((article) => {
    const link = `${siteConfig.url}/blog/${article.handle}`;
    return {
      title: article.title,
      link,
      id: link,
      summary: article.excerpt ?? "",
      contentHtml: article.contentHtml,
      publishedAt: article.publishedAt,
      author: article.author,
      categories: article.tags,
      image: article.image
        ? { url: article.image.url, title: article.title }
        : undefined,
    };
  });
}

export function journalFeedChannel(format: "rss" | "atom"): FeedChannel {
  return {
    title: `${siteConfig.name} — Journal`,
    link: `${siteConfig.url}/blog`,
    description: siteConfig.description,
    selfUrl: `${siteConfig.url}/blog/${format === "rss" ? "rss.xml" : "atom.xml"}`,
    language: "en",
  };
}
