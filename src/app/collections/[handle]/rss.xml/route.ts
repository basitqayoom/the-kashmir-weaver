import { buildRssXml } from "@/lib/feeds/build-rss";
import {
  collectionChannelMeta,
  mapProductsToFeedItems,
  productsInCollection,
} from "@/lib/feeds/product-feed";
import {
  getAllProductsForCatalog,
  getCollectionByHandle,
} from "@/lib/shopify/products";
import { siteConfig } from "@/config/site";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    return new Response("Collection not found", { status: 404 });
  }

  const products = productsInCollection(
    await getAllProductsForCatalog(),
    handle,
  );
  const meta = collectionChannelMeta(collection);

  const xml = buildRssXml(
    {
      title: meta.title,
      link: meta.link,
      description: meta.description,
      selfUrl: `${siteConfig.url}/collections/${encodeURIComponent(handle)}/rss.xml`,
      language: "en",
    },
    mapProductsToFeedItems(products),
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
