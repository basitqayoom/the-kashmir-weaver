export type CraftTime = {
  /** Time on the loom. */
  weaving: string;
  /** Hand pattern work after the loom — omitted when the pattern is woven in. */
  pattern?: string;
};

/**
 * Loom and hand-work time by weave family. Solids are deliberately absent —
 * their `custom.weave` metafield already states the 4–7 day loom time, and
 * they carry no pattern work.
 */
const CRAFT_TIME: Record<string, CraftTime> = {
  kani: {
    weaving: "12–18 months — the pattern is woven in, bobbin by bobbin",
  },
  sozni: {
    weaving: "4–7 days",
    pattern: "Several weeks to 12 months of hand sozni needlework",
  },
  "maheen-kari": {
    weaving: "4–7 days",
    pattern: "6–12 months of dense all-over needlework",
  },
  jamawar: {
    weaving: "4–7 days",
    pattern: "6–12 months of all-over sozni needlework",
  },
  tilla: {
    weaving: "4–7 days",
    pattern: "Several weeks to months of metallic threadwork",
  },
  jali: {
    weaving: "4–7 days",
    pattern: "Several weeks to months of openwork",
  },
  reversible: {
    weaving: "5–7 days — two faces woven as one cloth",
  },
};

const SOLID_HANDLES = new Set(["solids", "solid", "plain"]);

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * Craft time for a product, matched on its collection handles and product type.
 * Returns null for solids and for anything with no known weave family.
 */
export function craftTimeFor(product: {
  productType?: string;
  collections: { nodes: { handle: string }[] };
}): CraftTime | null {
  const keys = [
    ...product.collections.nodes.map((c) => normalise(c.handle)),
    ...(product.productType ? [normalise(product.productType)] : []),
  ];

  if (keys.some((key) => SOLID_HANDLES.has(key))) return null;

  for (const key of keys) {
    const match = CRAFT_TIME[key];
    if (match) return match;
  }
  return null;
}
