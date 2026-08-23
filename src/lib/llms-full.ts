import { siteConfig } from "@/config/site";
import type { JournalArticle } from "@/lib/shopify/journal";
import type { Collection, ProductCard } from "@/lib/shopify/types";

function note(text: string | undefined, max = 140): string {
  const trimmed = text?.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

function mdLink(path: string, label: string, description?: string): string {
  const url = `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
  const suffix = description ? `: ${description}` : "";
  return `- [${label}](${url})${suffix}`;
}

export function buildLlmsFullDocument(options: {
  products: ProductCard[];
  collections: Collection[];
  journalPosts: JournalArticle[];
}): string {
  const { products, collections, journalPosts } = options;

  const lines: string[] = [
    `# ${siteConfig.name}`,
    "",
    "> Extended machine-readable catalog for AI agents and LLMs. For a curated overview, see /llms.txt.",
    "",
    "This file lists every published product, collection, and journal article currently available on the storefront. Prices and inventory change in Shopify — follow links for live data.",
    "",
    "## Products",
    "",
  ];

  if (products.length) {
    for (const product of products) {
      const primaryCollection = product.collections.nodes[0];
      const desc =
        note(primaryCollection?.title) ||
        note(product.productType) ||
        note(product.vendor);
      lines.push(
        mdLink(`/products/${product.handle}`, product.title, desc || undefined),
      );
    }
  } else {
    lines.push("- _(No products in catalog snapshot)_");
  }

  lines.push("", "## Collections", "");

  if (collections.length) {
    for (const collection of collections) {
      lines.push(
        mdLink(
          `/collections/${collection.handle}`,
          collection.title,
          note(collection.description) || undefined,
        ),
      );
    }
  } else {
    lines.push("- _(No collections in catalog snapshot)_");
  }

  lines.push("", "## Journal", "");

  if (journalPosts.length) {
    for (const post of journalPosts) {
      lines.push(
        mdLink(
          `/blog/${post.handle}`,
          post.title,
          note(post.excerpt ?? undefined) || undefined,
        ),
      );
    }
  } else {
    lines.push("- _(No journal articles)_");
  }

  lines.push("", "## Editorial pages", "");
  const editorial: Array<[string, string, string?]> = [
    ["/", "Home"],
    ["/shop", "Shop all products"],
    ["/collections", "Collections index"],
    ["/heritage", "Heritage"],
    ["/craft", "The craft"],
    ["/faq", "FAQ"],
    ["/care-guide", "Care guide"],
    ["/concierge", "Concierge — custom orders and gifting"],
    ["/pashmina-types", "Pashmina types guide"],
    ["/films", "Documentary films"],
    ["/wholesale", "Wholesale and corporate gifting"],
    ["/blog", "Journal index"],
    ["/terms", "Terms of service"],
    ["/shipping", "Shipping policy"],
    ["/returns", "Returns policy"],
  ];
  for (const [path, label, desc] of editorial) {
    lines.push(mdLink(path, label, desc));
  }

  lines.push("", "## Optional", "");
  lines.push(mdLink("/llms.txt", "Curated llms.txt", "Short agent overview"));
  lines.push(
    mdLink("/sitemap.xml", "Sitemap index", "All indexable URLs"),
  );
  lines.push(
    mdLink("/products/rss.xml", "Products RSS", "Product update feed"),
  );
  lines.push(
    mdLink("/blog/rss.xml", "Journal RSS", "Journal-only RSS feed"),
  );
  lines.push("");

  return lines.join("\n");
}
