import { siteConfig } from "@/config/site";

export async function GET() {
  const base = siteConfig.url;

  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} is a headless Shopify storefront. Product catalog, pricing, inventory, and checkout are live from Shopify. Editorial sections on the homepage (Heritage, Craft Process, FAQ) describe provenance and technique. Use the Contact form for bespoke commissions, wholesale, corporate gifting, and press inquiries.

## Shop

- [Shop all](${base}/shop): Full catalog with live filtering by collection, price, and colour
- [Collections](${base}/collections): Browse by weave and technique — Kani, Sozni, Solid Pashmina, and more
- [Search](${base}/search): Find products by name or collection

## Heritage & craft

- [Heritage](${base}/#heritage): Origin story — Himalayas, Changthangi goat, Srinagar looms
- [Craft process](${base}/#craft): Stages from raw fibre to finished pashmina
- [Journal](${base}/blog): Editorial articles on craft, provenance, and care
- [Pashmina types](${base}/pashmina-types): Guide to weaves and embroidery styles
- [Films](${base}/films): Short documentary films on the craft

## Customer service

- [Contact](${base}/#contact): Custom orders, bespoke commissions, wedding and corporate gifting, wholesale, press
- [FAQ](${base}/#faq): Authenticity, shipping, returns, and care

## Policies

- [Shipping](${base}/shipping): Delivery policy
- [Returns](${base}/returns): Return and refund policy
- [Privacy policy](${base}/privacy): Data handling
- [Terms of service](${base}/terms): Purchase terms

## Optional

- [Sitemap](${base}/sitemap.xml): Machine-readable index of all indexable URLs
- [llms-full.txt](${base}/llms-full.txt): Full product, collection, and journal catalog for AI agents
- [Journal RSS](${base}/blog/rss.xml): RSS 2.0 feed of journal articles
- [Journal Atom](${base}/blog/atom.xml): Atom 1.0 feed of journal articles
- [Products RSS](${base}/products/rss.xml): Product update RSS feed
- [Cart](${base}/cart): Current shopping bag (session-specific; not useful without user context)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
