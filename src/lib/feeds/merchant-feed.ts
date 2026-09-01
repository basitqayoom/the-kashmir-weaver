import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import { offerPriceValidUntil } from "@/lib/product-schema";
import { gidTail } from "@/lib/tracking-ids";
import { xmlEscape } from "./xml";

/** Google product taxonomy — "Apparel & Accessories > Clothing Accessories > Scarves & Shawls". */
const DEFAULT_GOOGLE_PRODUCT_CATEGORY = "1922";
const DEFAULT_MATERIAL = "Pashmina Cashmere";
const FREE_SHIPPING_THRESHOLD = 200;
const INTERNATIONAL_SHIPPING_RATE = 25;
const SHIPPING_WEIGHT_FALLBACK_G = 250;

export type FeedChannelName = "google" | "meta" | "pinterest";

export type FeedMoney = { amount: string; currencyCode: string };

export type FeedImage = { url: string; altText?: string | null };

export type FeedVariant = {
  id: string;
  title: string;
  sku?: string | null;
  barcode?: string | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  weight?: number | null;
  weightUnit?: string | null;
  price: FeedMoney;
  compareAtPrice?: FeedMoney | null;
  selectedOptions: Array<{ name: string; value: string }>;
  image?: FeedImage | null;
};

export type FeedProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  description: string;
  tags: string[];
  updatedAt?: string;
  availableForSale?: boolean;
  featuredImage?: FeedImage | null;
  images: { nodes: FeedImage[] };
  collections: { nodes: Array<{ handle: string; title: string }> };
  material?: { value: string } | null;
  googleCategory?: { value: string } | null;
  variants: { nodes: FeedVariant[] };
};

function plainText(html: string, maxLength = 4900): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function money(value: number, currency: string): string {
  return `${value.toFixed(2)} ${currency}`;
}

function optionValue(variant: FeedVariant, name: string): string | undefined {
  return variant.selectedOptions.find(
    (option) => option.name.toLowerCase() === name,
  )?.value;
}

function weightInGrams(variant: FeedVariant): number {
  if (!variant.weight) return SHIPPING_WEIGHT_FALLBACK_G;
  switch ((variant.weightUnit ?? "GRAMS").toUpperCase()) {
    case "KILOGRAMS":
      return variant.weight * 1000;
    case "POUNDS":
      return variant.weight * 453.592;
    case "OUNCES":
      return variant.weight * 28.3495;
    default:
      return variant.weight;
  }
}

/** Google requires an explicit expiry so stale offers are dropped, not disapproved. */
const priceValidUntil = offerPriceValidUntil;

function tag(name: string, value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "";
  return `<${name}>${xmlEscape(String(value))}</${name}>`;
}

function cdataTag(name: string, value: string | undefined | null): string {
  if (!value) return "";
  return `<${name}><![CDATA[${value.replace(/]]>/g, "]]&gt;")}]]></${name}>`;
}

function shippingBlocks(price: number, currency: string): string {
  const international =
    price >= FREE_SHIPPING_THRESHOLD ? 0 : INTERNATIONAL_SHIPPING_RATE;
  return [
    `<g:shipping><g:country>IN</g:country><g:service>Standard</g:service><g:price>${money(0, currency)}</g:price></g:shipping>`,
    `<g:shipping><g:country>US</g:country><g:service>Standard</g:service><g:price>${money(international, currency)}</g:price></g:shipping>`,
    `<g:shipping><g:country>GB</g:country><g:service>Standard</g:service><g:price>${money(international, currency)}</g:price></g:shipping>`,
  ].join("");
}

/**
 * Shopify's `barcode` field is often filled with an internal SKU. Google rejects
 * anything that is not a real 8/12/13/14-digit GTIN, so validate before sending.
 */
function validGtin(barcode: string | null | undefined): string | null {
  const digits = barcode?.trim().replace(/[\s-]/g, "") ?? "";
  if (!/^\d+$/.test(digits)) return null;
  return [8, 12, 13, 14].includes(digits.length) ? digits : null;
}

function variantEntry(
  product: FeedProduct,
  variant: FeedVariant,
  channel: FeedChannelName,
): string {
  const variantId = gidTail(variant.id);
  const productId = gidTail(product.id);
  const colour = optionValue(variant, "color") ?? optionValue(variant, "colour");
  const size = optionValue(variant, "size");
  const price = Number(variant.price.amount);
  const compareAt = variant.compareAtPrice
    ? Number(variant.compareAtPrice.amount)
    : 0;
  const onSale = compareAt > price;
  const currency = variant.price.currencyCode;

  const link = absoluteUrl(
    `/products/${product.handle}?variant=${encodeURIComponent(variantId)}`,
  );
  const primaryImage =
    variant.image?.url ??
    product.featuredImage?.url ??
    product.images.nodes[0]?.url;
  if (!primaryImage) return "";

  const additionalImages = product.images.nodes
    .map((image) => image.url)
    .filter((url) => url !== primaryImage)
    .slice(0, 10)
    .map((url) => tag("g:additional_image_link", url))
    .join("");

  const identifier = validGtin(variant.barcode);
  const description =
    plainText(product.description) ||
    `${product.title} — handwoven GI-certified Kashmiri Pashmina by ${siteConfig.name}.`;

  const productTypeParts = [
    product.productType,
    product.collections.nodes[0]?.title,
  ].filter(Boolean);

  return [
    "<item>",
    tag("g:id", variantId),
    tag("g:item_group_id", productId),
    cdataTag("g:title", `${product.title}${variant.title !== "Default Title" ? ` — ${variant.title}` : ""}`),
    cdataTag("g:description", description),
    tag("g:link", link),
    tag("g:image_link", primaryImage),
    additionalImages,
    tag(
      "g:availability",
      variant.availableForSale ? "in stock" : "out of stock",
    ),
    tag("g:condition", "new"),
    tag("g:price", money(onSale ? compareAt : price, currency)),
    onSale ? tag("g:sale_price", money(price, currency)) : "",
    // Must match the Product JSON-LD brand on the landing page, or Merchant
    // Center flags a mismatch between the feed and the crawled page.
    tag("g:brand", siteConfig.name),
    identifier ? tag("g:gtin", identifier) : "",
    tag("g:mpn", variant.sku?.trim() || variantId),
    tag("g:identifier_exists", identifier ? "yes" : "no"),
    tag(
      "g:google_product_category",
      product.googleCategory?.value?.trim() || DEFAULT_GOOGLE_PRODUCT_CATEGORY,
    ),
    productTypeParts.length
      ? cdataTag("g:product_type", productTypeParts.join(" > "))
      : "",
    colour ? tag("g:color", colour) : "",
    size ? tag("g:size", size) : "",
    tag("g:material", product.material?.value?.trim() || DEFAULT_MATERIAL),
    tag("g:age_group", "adult"),
    tag("g:gender", "unisex"),
    tag("g:is_bundle", "no"),
    shippingBlocks(price, currency),
    `<g:shipping_weight>${Math.round(weightInGrams(variant))} g</g:shipping_weight>`,
    tag("g:price_valid_until", priceValidUntil()),
    tag("g:custom_label_0", product.collections.nodes[0]?.title ?? "Catalogue"),
    tag("g:custom_label_1", onSale ? "On Sale" : "Full Price"),
    tag("g:custom_label_2", price >= FREE_SHIPPING_THRESHOLD ? "Free Shipping" : "Standard Shipping"),
    tag("g:custom_label_3", product.productType || "Pashmina"),
    tag("g:custom_label_4", product.tags.slice(0, 3).join("/") || "Handwoven"),
    // Pinterest reads the plain RSS elements rather than the g: namespace.
    channel === "pinterest" ? tag("title", product.title) : "",
    channel === "pinterest" ? tag("link", link) : "",
    "</item>",
  ]
    .filter(Boolean)
    .join("");
}

const CHANNEL_TITLES: Record<FeedChannelName, string> = {
  google: `${siteConfig.name} — Google Merchant Center Feed`,
  meta: `${siteConfig.name} — Meta Commerce Catalogue Feed`,
  pinterest: `${siteConfig.name} — Pinterest Catalogue Feed`,
};

/**
 * RSS 2.0 with the `g:` namespace — the format Google Merchant Center, Meta
 * Commerce Manager and Pinterest Catalogs all ingest. IDs are Shopify numeric
 * variant IDs so they match the `content_ids` sent by the storefront pixels.
 */
export function buildMerchantFeed(
  products: FeedProduct[],
  channel: FeedChannelName,
): string {
  const items = products
    .flatMap((product) =>
      product.variants.nodes.map((variant) =>
        variantEntry(product, variant, channel),
      ),
    )
    .filter(Boolean)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${xmlEscape(CHANNEL_TITLES[channel])}</title>
<link>${xmlEscape(siteConfig.url)}</link>
<description>${xmlEscape(siteConfig.description)}</description>
<language>en</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;
}
