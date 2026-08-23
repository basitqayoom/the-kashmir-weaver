import { isColorOptionName } from "./parse-size-option";
import { SHADES, type Shade } from "./shades";
import type { ProductCard } from "./types";

export type CatalogColor = {
  name: string;
  /** Hex from shade code / palette match when resolvable. */
  hex?: string;
};

const SHADE_BY_CODE = new Map(
  SHADES.map((shade) => [shade.code.toLowerCase(), shade] as const),
);

/** Match `set0-shade-113.png`-style image filenames. */
const SHADE_IN_URL = /shade-([0-9]+(?:-[A-Z]+)?)/i;

function shadeByCode(code: string | undefined): Shade | undefined {
  if (!code) return undefined;
  return SHADE_BY_CODE.get(code.toLowerCase());
}

function shadeCodeFromProduct(product: ProductCard): string | undefined {
  for (const image of [product.featuredImage, ...product.images.nodes]) {
    const match = image?.url.match(SHADE_IN_URL);
    if (match?.[1]) return match[1];
  }
  return undefined;
}

function hexForColorName(
  name: string,
  productHex?: string,
): string | undefined {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return productHex;

  const byFamily = SHADES.find(
    (shade) => shade.family.toLowerCase() === normalized,
  );
  if (byFamily) return byFamily.hex;

  const byCode = shadeByCode(name.trim());
  if (byCode) return byCode.hex;

  return productHex;
}

/** Colour option values on a product, with hex when we can resolve one. */
export function extractProductColors(product: ProductCard): CatalogColor[] {
  const names = new Set<string>();

  const colorOption = product.options?.find((option) =>
    isColorOptionName(option.name),
  );
  for (const value of colorOption?.values ?? []) {
    if (value.trim()) names.add(value.trim());
  }

  if (!names.size) return [];

  const productHex = shadeByCode(shadeCodeFromProduct(product))?.hex;
  const singleColorHex = names.size === 1 ? productHex : undefined;

  return [...names]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const hex = hexForColorName(name, singleColorHex);
      return hex ? { name, hex } : { name };
    });
}

/** Unique colours across a product list (for filter sidebars). */
export function collectColorsFromProducts(
  products: ProductCard[],
): CatalogColor[] {
  const byName = new Map<string, CatalogColor>();

  for (const product of products) {
    for (const color of extractProductColors(product)) {
      const key = color.name.toLowerCase();
      const existing = byName.get(key);
      if (!existing) {
        byName.set(key, color);
        continue;
      }
      if (!existing.hex && color.hex) {
        byName.set(key, color);
      }
    }
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function productMatchesColors(
  product: ProductCard,
  selected: string[],
): boolean {
  if (!selected.length) return true;
  const selectedSet = new Set(selected.map((name) => name.toLowerCase()));
  return extractProductColors(product).some((color) =>
    selectedSet.has(color.name.toLowerCase()),
  );
}
