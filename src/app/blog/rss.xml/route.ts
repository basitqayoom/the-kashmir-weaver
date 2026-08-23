import { getJournalArticles } from "@/lib/shopify/journal";
import { buildRssXml } from "@/lib/feeds/build-rss";
import {
  journalArticlesToFeedItems,
  journalFeedChannel,
} from "@/lib/feeds/journal-feed";

export async function GET() {
  const articles = await getJournalArticles();
  const xml = buildRssXml(
    journalFeedChannel("rss"),
    journalArticlesToFeedItems(articles),
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
