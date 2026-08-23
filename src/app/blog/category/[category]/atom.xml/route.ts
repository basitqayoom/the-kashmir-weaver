import { getJournalArticles } from "@/lib/shopify/journal";
import { buildAtomXml } from "@/lib/feeds/build-atom";
import { journalArticlesToFeedItems } from "@/lib/feeds/journal-feed";
import {
  filterJournalFeedItems,
  filteredJournalFeedChannel,
} from "@/lib/feeds/journal-filtered";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;
  const articles = await getJournalArticles(250);
  const items = filterJournalFeedItems(
    journalArticlesToFeedItems(articles),
    "category",
    category,
  );
  const xml = buildAtomXml(
    filteredJournalFeedChannel("category", category, "atom"),
    items,
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
