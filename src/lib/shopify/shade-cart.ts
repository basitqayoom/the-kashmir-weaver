import type { Shade } from "./shades";
import { SHADES } from "./shades";
import { findShadeByCode } from "./colour-studio";

/**
 * Keys match Hydrogen's `shade-cart.ts` exactly, so order/fulfillment data stays
 * consistent if the merchant ever runs both storefronts against the same store.
 */
export const SHADE_CART_ATTR = {
  code: "Shade code",
  colour: "Colour",
  hex: "Shade hex",
} as const;

export type CartLineAttribute = { key: string; value: string };

export type ParsedCartShade = {
  code?: string;
  family?: string;
  hex?: string;
};

function normalizeHex(hex: string | null | undefined): string | undefined {
  const value = hex?.trim();
  if (!value) return undefined;
  return value.startsWith("#") ? value : `#${value}`;
}

type CartAttributeLike = { key?: string | null; value?: string | null } | null;

/** Builds the custom cart-line attributes for a chosen shade (add-to-cart time). */
export function shadeCartAttributes(
  shade: Shade | null | undefined,
): CartLineAttribute[] {
  if (!shade) return [];
  const hex = normalizeHex(shade.hex);
  return [
    { key: SHADE_CART_ATTR.code, value: shade.code },
    { key: SHADE_CART_ATTR.colour, value: shade.family },
    ...(hex ? [{ key: SHADE_CART_ATTR.hex, value: hex }] : []),
  ];
}

export function shadeCartAttributesFromSearch(
  searchParams: URLSearchParams,
): CartLineAttribute[] {
  const code = searchParams.get("shadeCode")?.trim();
  const colour = searchParams.get("shadeColour")?.trim();
  const hex =
    normalizeHex(searchParams.get("shadeHex")) ??
    (code ? normalizeHex(findShadeByCode(SHADES, code)?.hex) : undefined);
  const attrs: CartLineAttribute[] = [];
  if (code) attrs.push({ key: SHADE_CART_ATTR.code, value: code });
  if (colour) attrs.push({ key: SHADE_CART_ATTR.colour, value: colour });
  if (hex) attrs.push({ key: SHADE_CART_ATTR.hex, value: hex });
  return attrs;
}

export function buildBuyNowShadeQuery(shade: Shade | null | undefined): string {
  if (!shade) return "";
  const params = new URLSearchParams();
  params.set("shadeCode", shade.code);
  params.set("shadeColour", shade.family);
  params.set("shadeHex", shade.hex);
  return params.toString();
}

export function hasShadeCartAttributes(
  attributes: CartAttributeLike[] | null | undefined,
): boolean {
  return parseShadeFromCartAttributes(attributes) != null;
}

/** Reads a shade back out of cart-line attributes (drawer/cart page display). */
export function parseShadeFromCartAttributes(
  attributes: CartAttributeLike[] | null | undefined,
): ParsedCartShade | null {
  const code =
    attributes?.find((a) => a?.key === SHADE_CART_ATTR.code)?.value ??
    undefined;
  const family =
    attributes?.find((a) => a?.key === SHADE_CART_ATTR.colour)?.value ??
    undefined;
  let hex =
    attributes?.find((a) => a?.key === SHADE_CART_ATTR.hex)?.value ?? undefined;
  if (!code && !family && !hex) return null;
  if (!hex && code) {
    hex = findShadeByCode(SHADES, code)?.hex;
  }
  const normalizedHex = normalizeHex(hex);
  return {
    ...(code ? { code } : {}),
    ...(family ? { family } : {}),
    ...(normalizedHex ? { hex: normalizedHex } : {}),
  };
}

export function formatShadeCartLabel(
  attributes: CartAttributeLike[] | null | undefined,
): string | null {
  const parsed = parseShadeFromCartAttributes(attributes);
  if (!parsed) return null;
  const { code, family } = parsed;
  if (family && code) return `${family} (${code})`;
  if (family) return family;
  if (code) return code;
  return null;
}

// Re-exported for callers that only have a shade catalog + code (e.g. deep links).
export { findShadeByCode };
