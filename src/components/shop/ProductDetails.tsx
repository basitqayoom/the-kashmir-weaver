import Link from "next/link";
import type { ProductDetail, ProductVariant } from "@/lib/shopify/types";
import {
  parseAccordionItems,
  parseBulletItems,
  parseTextBlocks,
} from "@/lib/shopify/product-content";
import {
  formatVariantWeight,
  isDefaultOption,
  optionDisplayName,
  parseSizeOptionValue,
} from "@/lib/shopify/parse-size-option";
import { craftTimeFor } from "@/lib/shopify/craft-time";

// Bulk-seeded across ~99% of the catalog's `custom.story` metafield — never replaced with real
// per-product copy. Hide the Story section rather than show visitors literal placeholder text.
const PLACEHOLDER_STORY_MARKER = "a test passage for the story section";

function isPlaceholderStory(value: string): boolean {
  return value.toLowerCase().includes(PLACEHOLDER_STORY_MARKER);
}

function PlusIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function Accordion({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="accordion group" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-accent text-[11px] uppercase tracking-[0.2em] text-charcoal [&::-webkit-details-marker]:hidden">
        {title}
        <PlusIcon />
      </summary>
      <div className="pb-6 text-sm leading-relaxed text-charcoal/70">{children}</div>
    </details>
  );
}

function specRows(product: ProductDetail, selectedVariant: ProductVariant | null) {
  const variants = product.variants.nodes;
  const sizeOptions = product.options.filter((o) => !isDefaultOption(o));
  const selectedWeight = selectedVariant
    ? formatVariantWeight(selectedVariant.weight, selectedVariant.weightUnit)
    : null;
  const fallbackWeights = Array.from(
    new Set(
      variants
        .map((v) => formatVariantWeight(v.weight, v.weightUnit))
        .filter((w): w is string => Boolean(w)),
    ),
  );
  const selectedSku = selectedVariant?.sku ?? null;
  const fallbackSkus = Array.from(new Set(variants.map((v) => v.sku).filter(Boolean)));

  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value?: string | null) => {
    if (value && value.trim()) rows.push({ label, value: value.trim() });
  };

  push("Material", product.material?.value);
  push("Weave", product.weave?.value);
  push("Origin", product.origin?.value);
  // Shopify product types are stored lower-cased ("pashmina").
  push(
    "Craft",
    product.productType
      ? product.productType.charAt(0).toUpperCase() + product.productType.slice(1)
      : null,
  );

  const craft = craftTimeFor(product);
  push("Time on the loom", craft?.weaving);
  push("Pattern work", craft?.pattern);

  for (const option of sizeOptions) {
    push(
      optionDisplayName(option.name),
      option.values
        .map((value) => {
          const { label, dimensions } = parseSizeOptionValue(value);
          return dimensions ? `${label} (${dimensions})` : label;
        })
        .join(" · "),
    );
  }

  push("Weight", selectedWeight ?? fallbackWeights.join(" · "));
  push("Certification", "GI-Certified Kashmiri Pashmina");
  push("Edition", product.limited?.value === "true" ? "Limited — one of a kind" : null);
  push("SKU", selectedSku ?? fallbackSkus.join(" · "));

  return rows;
}

/** Scannable spec table plus the long-form accordions, below the buy box. */
export default function ProductDetails({
  product,
  selectedVariant = null,
}: {
  product: ProductDetail;
  /** Weight/SKU rows reflect this variant; falls back to an aggregate across all variants when absent. */
  selectedVariant?: ProductVariant | null;
}) {
  const rows = specRows(product, selectedVariant);
  const story =
    product.story?.value && !isPlaceholderStory(product.story.value)
      ? product.story.value
      : null;
  const care = parseTextBlocks(product.care?.value);
  const delivery = parseAccordionItems(product.guaranteesDelivery?.value);
  const returnsCare = parseBulletItems(product.returnsCare?.value);

  return (
    <section className="mt-16 border-t border-charcoal/10 pt-12 lg:mt-20">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow text-gold-text">At a glance</p>
          <h2 className="mt-3 font-heading text-2xl font-bold text-charcoal sm:text-3xl">
            Specifications
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">{product.title} specifications</caption>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-charcoal/10 align-top">
                    <th
                      scope="row"
                      className="w-2/5 py-3 pr-4 font-accent text-[10px] font-normal uppercase tracking-[0.15em] text-charcoal/70"
                    >
                      {row.label}
                    </th>
                    <td className="py-3 text-charcoal">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-7">
          <p className="eyebrow text-gold-text">The long read</p>
          <h2 className="mt-3 font-heading text-2xl font-bold text-charcoal sm:text-3xl">
            Everything else
          </h2>
          <div className="mt-6 divide-y divide-charcoal/10 border-t border-charcoal/10">
            {story && (
              <Accordion title="Story" open>
                <p>{story}</p>
              </Accordion>
            )}

            {care.length > 0 && (
              <Accordion title="Care">
                {care.map((block) => (
                  <p key={block} className="mb-3 last:mb-0">
                    {block}
                  </p>
                ))}
                <Link
                  href="/care-guide"
                  className="font-accent mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold-text transition-colors hover:text-gold-dark"
                >
                  Full care guide
                  <span aria-hidden="true">→</span>
                </Link>
              </Accordion>
            )}

            {delivery.length > 0 && (
              <Accordion title="Guarantees &amp; Delivery">
                <dl className="space-y-4">
                  {delivery.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <span aria-hidden="true" className="mt-0.5 shrink-0 text-gold">
                        ✦
                      </span>
                      <div className="min-w-0">
                        <dt className="font-medium text-charcoal">{item.title}</dt>
                        {item.body && <dd className="mt-1">{item.body}</dd>}
                      </div>
                    </div>
                  ))}
                </dl>
              </Accordion>
            )}

            {returnsCare.length > 0 && (
              <Accordion title="Returns &amp; Care">
                <ul className="space-y-3">
                  {returnsCare.map((item) => (
                    <li key={item.text} className="flex gap-3">
                      <span aria-hidden="true" className="mt-0.5 shrink-0 text-gold">
                        ✦
                      </span>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="text-gold-text transition-colors hover:text-gold-dark"
                        >
                          {item.text}
                        </Link>
                      ) : (
                        <span>{item.text}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Accordion>
            )}

            <Accordion title="Full Description">
              <div
                className="max-w-none [&_li]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
