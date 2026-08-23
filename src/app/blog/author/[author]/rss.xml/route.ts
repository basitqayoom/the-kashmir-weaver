import { getJournalArticles } from "@/lib/shopify/journal";
import { buildRssXml } from "@/lib/feeds/build-rss";
import { journalArticlesToFeedItems } from "@/lib/feeds/journal-feed";
import {
  filterJournalFeedItems,
  filteredJournalFeedChannel,
} from "@/lib/feeds/journal-filtered";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ author: string }> },
) {
  const { author } = await params;
  const articles = await getJournalArticles(250);
  const items = filterJournalFeedItems(
    journalArticlesToFeedItems(articles),
    "author",
    author,
  );
  const xml = buildRssXml(
    filteredJournalFeedChannel("author", author, "rss"),
    items,
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
