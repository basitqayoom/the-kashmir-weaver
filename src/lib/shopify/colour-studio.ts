import type { ProductDetail } from "./types";
import type { Shade } from "./shades";

export type { Shade };

/** Parses the raw `custom.shade_palette` metafield value. */
export function parseShadePalette(raw: string | null | undefined): Shade[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is Shade =>
        typeof s?.code === "string" &&
        typeof s?.hex === "string" &&
        typeof s?.family === "string",
    );
  } catch {
    return [];
  }
}

/**
 * Per-product colour studio data — distinct from `shades.ts`'s static catalog
 * palette (used for shop-filter swatches). This parses the `custom.shade_palette`
 * metafield, which is maintained independently per product in Shopify and only
 * populated on the one "hand-dyed to order" solid product today.
 */
export function getProductShades(product: ProductDetail): Shade[] {
  return parseShadePalette(product.shadePalette?.value);
}

/** Mirrors Hydrogen's ProductView gating exactly: metafield flag AND a non-empty palette. */
export function productUsesColourStudio(product: ProductDetail): boolean {
  return (
    product.showColourStudio?.value === "true" &&
    getProductShades(product).length > 0
  );
}

export function findShadeByCode(
  shades: Shade[],
  code: string,
): Shade | undefined {
  return shades.find((shade) => shade.code === code);
}

/** Default PDP shade — middle entry in the product palette. */
export function getDefaultShadeCode(shades: Shade[]): string {
  if (!shades.length) return "";
  return shades[Math.floor(shades.length / 2)]!.code;
}

export const COLOUR_STUDIO_DISCLAIMER =
  "Colour studio is in beta — preview is a guide only. Colours shown are representative; slight variation may occur between the preview and the finished, hand-dyed piece.";

/* -------------------------------------------------------------------------- */
/* Tone grouping — buckets any hex into a small set of navigable tones so a    */
/* 200+ shade palette stays browsable in the studio grid.                     */
/* -------------------------------------------------------------------------- */

export type ToneKey =
  | "Neutral"
  | "Yellow"
  | "Orange"
  | "Brown"
  | "Red"
  | "Pink"
  | "Purple"
  | "Blue"
  | "Teal"
  | "Green";

export const TONE_ORDER: ToneKey[] = [
  "Neutral",
  "Yellow",
  "Orange",
  "Brown",
  "Red",
  "Pink",
  "Purple",
  "Blue",
  "Teal",
  "Green",
];

type Hsl = { h: number; s: number; l: number };

export function hexToHsl(hex: string): Hsl {
  let value = hex.trim().replace("#", "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
  }

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

/** Bucket any hex into one of a small set of navigable tones. */
export function toneOf(hex: string): ToneKey {
  const { h, s, l } = hexToHsl(hex);

  if (s < 0.12) return "Neutral";
  if (l > 0.88 && s < 0.32) return "Neutral";
  if (h >= 18 && h < 50 && s < 0.6 && l < 0.62) return "Brown";

  if (h < 14) return "Red";
  if (h < 45) return "Orange";
  if (h < 68) return "Yellow";
  if (h < 160) return "Green";
  if (h < 200) return "Teal";
  if (h < 255) return "Blue";
  if (h < 292) return "Purple";
  if (h < 335) return "Pink";
  return "Red";
}

export type ToneGroup = { tone: ToneKey; shades: Shade[]; swatchHex: string };

/**
 * Group shades into tones, preserving the original palette order within each
 * group. Only tones that actually contain shades are returned, in TONE_ORDER.
 */
export function groupShadesByTone(shades: Shade[]): ToneGroup[] {
  const buckets = new Map<ToneKey, Shade[]>();
  for (const shade of shades) {
    const tone = toneOf(shade.hex);
    const list = buckets.get(tone);
    if (list) list.push(shade);
    else buckets.set(tone, [shade]);
  }

  const groups: ToneGroup[] = [];
  for (const tone of TONE_ORDER) {
    const list = buckets.get(tone);
    if (!list || list.length === 0) continue;
    groups.push({ tone, shades: list, swatchHex: representativeHex(list) });
  }
  return groups;
}

function representativeHex(shades: Shade[]): string {
  let best = shades[0]!;
  let bestScore = Infinity;
  for (const shade of shades) {
    const { l } = hexToHsl(shade.hex);
    const score = Math.abs(l - 0.5);
    if (score < bestScore) {
      bestScore = score;
      best = shade;
    }
  }
  return best.hex;
}

/** True when a hex is light enough that overlays need a dark tick/ring. */
export function isLightHex(hex: string): boolean {
  return hexToHsl(hex).l > 0.62;
}
