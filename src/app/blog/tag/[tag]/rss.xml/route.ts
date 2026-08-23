import { getJournalArticles } from "@/lib/shopify/journal";
import { buildRssXml } from "@/lib/feeds/build-rss";
import { journalArticlesToFeedItems } from "@/lib/feeds/journal-feed";
import {
  filterJournalFeedItems,
  filteredJournalFeedChannel,
} from "@/lib/feeds/journal-filtered";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tag: string }> },
) {
  const { tag } = await params;
  const articles = await getJournalArticles(250);
  const items = filterJournalFeedItems(
    journalArticlesToFeedItems(articles),
    "tag",
    tag,
  );
  const xml = buildRssXml(filteredJournalFeedChannel("tag", tag, "rss"), items);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
