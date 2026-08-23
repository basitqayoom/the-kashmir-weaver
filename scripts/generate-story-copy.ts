/**
 * Generate replacement `custom.story` copy for every product whose current value is the
 * bulk-seeded placeholder ("...a test passage for the story section...") or a lightly
 * templated variant of it (see docs from the 2026-08-23 QA audit).
 *
 * This is a STARTING POINT, not final brand copy — it's template-generated from real product
 * attributes (collection/weave family + colour) using the studio's own craft terminology so it
 * reads as genuine editorial rather than a single repeated sentence. A human should review/edit
 * before importing. This script is READ-ONLY against Shopify — it does not write anything back;
 * it only prints a CSV (handle,current_story,suggested_story) to stdout for manual review/import.
 *
 * Usage: npx tsx scripts/generate-story-copy.ts > story-copy-review.csv
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvFile(resolve(ROOT, ".env.local"));
loadEnvFile(resolve(ROOT, ".env"));

const SHOP = process.env.PUBLIC_STORE_DOMAIN!;
const TOKEN = process.env.PUBLIC_STOREFRONT_API_TOKEN!;
const API_VERSION = process.env.PUBLIC_STOREFRONT_API_VERSION || "2026-01";

type Product = {
  handle: string;
  title: string;
  collections: { nodes: { title: string; handle: string }[] };
  story: { value: string } | null;
};

async function fetchAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 6; i++) {
    const query = `
      query($after: String) {
        products(first: 100, after: $after) {
          edges {
            cursor
            node {
              handle
              title
              collections(first: 3) { nodes { title handle } }
              story: metafield(namespace: "custom", key: "story") { value }
            }
          }
          pageInfo { hasNextPage }
        }
      }
    `;
    const res = await fetch(`https://${SHOP}/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query, variables: { after: cursor } }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    const edges = json.data.products.edges as { cursor: string; node: Product }[];
    all.push(...edges.map((e) => e.node));
    if (!json.data.products.pageInfo.hasNextPage) break;
    cursor = edges[edges.length - 1].cursor;
  }
  return all;
}

const PLACEHOLDER_MARKER = "a test passage for the story section";
const TEMPLATED_MARKER = "every thread carries the silence of the changthang plateau";

function isGeneratedPlaceholder(story: string | null | undefined): boolean {
  if (!story) return false;
  const lower = story.toLowerCase();
  return lower.includes(PLACEHOLDER_MARKER) || lower.includes(TEMPLATED_MARKER);
}

/** Weave-family terminology, keyed by the product's primary collection handle. */
const FAMILY_COPY: Record<
  string,
  { craftsperson: string; verb: string; detail: string }
> = {
  sozni: {
    craftsperson: "Rafugar",
    verb: "needle-embroiders",
    detail:
      "each motif built stitch by stitch with a fine sozni needle, a single panel often taking months to complete",
  },
  kani: {
    craftsperson: "Wovur",
    verb: "weaves",
    detail:
      "reading the pattern from a coded Talim manuscript and working dozens of small wooden bobbins, one per colour, through the warp",
  },
  "maheen-kari": {
    craftsperson: "Naqash and Rafugar",
    verb: "draw and embroider",
    detail:
      "a finer, denser cousin of sozni work, where the pattern is drawn first and then embroidered so closely it reads almost as woven brocade",
  },
  reversible: {
    craftsperson: "Wovur",
    verb: "double-weaves",
    detail:
      "two complete faces woven as one cloth on the wooden Saaz, so both sides can be worn with no visible reverse",
  },
  solids: {
    craftsperson: "Ranger",
    verb: "hand-dyes",
    detail:
      "the undyed Changthangi fibre is hand-spun on a yinder before a single azo-free colour is worked through it by hand",
  },
};

const DEFAULT_FAMILY = FAMILY_COPY.solids;

/** A handful of rotating opening/closing sentence shapes so copy doesn't read identically within a family. */
const OPENERS = [
  (color: string) =>
    `This ${color.toLowerCase()} piece begins, as every Kashmir Weaver piece does, on the Changthang plateau of Ladakh, 4,500 metres up, where the Changthangi goat sheds its winter undercoat each spring.`,
  (color: string) =>
    `Before it was a ${color.toLowerCase()} shawl, it was raw pashm — hand-combed, never sheared, from a Changthangi goat on the high plateaus of Ladakh.`,
  (color: string) =>
    `Every ${color.toLowerCase()} thread in this piece can be traced back to the same source: the Changthangi goats of Ladakh, and the herders who comb their undercoat by hand each spring.`,
  (color: string) =>
    `The story of this ${color.toLowerCase()} piece starts 4,500 metres above sea level, on the wind-scoured plateau where the Changthangi goat grows the world's finest undercoat.`,
];

const CLOSERS = [
  () =>
    `No two pieces are ever quite identical — the mark of a human hand, not a machine, at every stage.`,
  () =>
    `From goat to loom to your shoulders, every stage stayed in the hands of the same small community of Kashmiri artisans.`,
  () =>
    `It carries the same GI-certified provenance as every piece in our atelier — a direct line back to the artisans who made it.`,
  () =>
    `What reaches you is the result of that entire chain, unbroken, exactly as it has run for centuries.`,
];

/** Pull a plausible colour name out of the product title (first 1-2 words before the weave-type keyword). */
function guessColor(title: string): string {
  const stripped = title
    .replace(/handwoven|kashmir|shawl|scarf|pashmina|cashmere|authentic|&|—.*$/gi, "")
    .trim();
  const words = stripped.split(/\s+/).filter(Boolean);
  return words.slice(0, 2).join(" ") || "custom-dyed";
}

/** Deterministic pseudo-random index from a string, so the same product always gets the same template. */
function hashIndex(input: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % mod;
}

function primaryFamilyKey(product: Product): string {
  const handles = product.collections.nodes.map((c) => c.handle);
  return handles.find((h) => h in FAMILY_COPY) ?? "solids";
}

function generateStory(product: Product): string {
  const familyKey = primaryFamilyKey(product);
  const family = FAMILY_COPY[familyKey] ?? DEFAULT_FAMILY;
  const color = guessColor(product.title);
  const opener = OPENERS[hashIndex(product.handle, OPENERS.length)](color);
  const closer = CLOSERS[hashIndex(product.handle + "close", CLOSERS.length)]();
  const middle = `From there it travels to Srinagar, where a master ${family.craftsperson} ${family.verb} it by hand — ${family.detail}.`;
  return `${opener} ${middle} ${closer}`;
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

async function main() {
  if (!SHOP || !TOKEN) {
    console.error("Missing PUBLIC_STORE_DOMAIN / PUBLIC_STOREFRONT_API_TOKEN in .env.local");
    process.exit(1);
  }
  const products = await fetchAllProducts();
  const toReplace = products.filter((p) => isGeneratedPlaceholder(p.story?.value));

  console.log("handle,title,current_story,suggested_story");
  for (const p of toReplace) {
    const suggested = generateStory(p);
    console.log(
      [p.handle, p.title, p.story?.value ?? "", suggested].map(csvEscape).join(","),
    );
  }
  console.error(
    `\n${toReplace.length}/${products.length} products flagged as placeholder/templated story copy.`,
  );
  console.error("Review the suggested_story column, edit as needed, then import via Shopify admin/API.");
}

main();
