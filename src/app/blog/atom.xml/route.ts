import { getJournalArticles } from "@/lib/shopify/journal";
import { buildAtomXml } from "@/lib/feeds/build-atom";
import {
  journalArticlesToFeedItems,
  journalFeedChannel,
} from "@/lib/feeds/journal-feed";

export async function GET() {
  const articles = await getJournalArticles();
  const xml = buildAtomXml(
    journalFeedChannel("atom"),
    journalArticlesToFeedItems(articles),
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
