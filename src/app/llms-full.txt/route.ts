import { buildLlmsFullDocument } from "@/lib/llms-full";
import { getJournalArticles } from "@/lib/shopify/journal";
import {
  getAllProductsForCatalog,
  getCollections,
} from "@/lib/shopify/products";

export async function GET() {
  const [products, collections, journalPosts] = await Promise.all([
    getAllProductsForCatalog(),
    getCollections(),
    getJournalArticles(250),
  ]);

  const body = buildLlmsFullDocument({ products, collections, journalPosts });

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
