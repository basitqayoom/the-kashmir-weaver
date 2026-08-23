import { extractProductColors } from "./catalog-colors";
import { toneOf } from "./colour-studio";
import { SHADES } from "./shades";
import type { ProductCard } from "./types";

export const SOLIDS_COLLECTION_HANDLE = "solids";

const SHADE_BY_FAMILY = new Map<string, (typeof SHADES)[number]>();
for (const shade of SHADES) {
  const key = shade.family.toLowerCase();
  if (!SHADE_BY_FAMILY.has(key)) SHADE_BY_FAMILY.set(key, shade);
}

export function solidColorNameFromTitle(title: string): string | undefined {
  const trimmed = title.trim();
  const modern = trimmed.match(/^(.+?)\s+Cashmere Scarf & Pashmina Shawl/i);
  if (modern?.[1]) return modern[1].trim();
  const legacy = trimmed.match(/^Handwoven Luxury Solid\s+(.+?)\s+Cashmere Pashmina/i);
  if (legacy?.[1]) return legacy[1].trim();
  return undefined;
}

export function getSolidFamilyKey(product: ProductCard): string {
  const colors = extractProductColors(product);
  const colorName = colors[0]?.name?.trim() || solidColorNameFromTitle(product.title);
  let hex = colors[0]?.hex;

  if (colorName) {
    const byFamily = SHADE_BY_FAMILY.get(colorName.toLowerCase());
    if (byFamily) hex = hex ?? byFamily.hex;
  }

  if (hex) return toneOf(hex);
  if (colorName) return colorName.toLowerCase().split(/\s+/).pop() ?? colorName;
  return `id:${product.id}`;
}

export function orderProductsBySolidFamily(
  products: ProductCard[],
  limit?: number,
): ProductCard[] {
  if (products.length <= 1) return limit != null ? products.slice(0, limit) : products;

  const queues = new Map<string, ProductCard[]>();
  for (const item of products) {
    const key = getSolidFamilyKey(item);
    const list = queues.get(key);
    if (list) list.push(item);
    else queues.set(key, [item]);
  }

  const result: ProductCard[] = [];
  let lastFamily: string | null = null;
  while (result.length < products.length) {
    if (limit != null && result.length >= limit) break;
    let pickFamily: string | null = null;
    let pickSize = -1;
    for (const [family, queue] of queues) {
      if (!queue.length) continue;
      if (family === lastFamily) continue;
      if (queue.length > pickSize) {
        pickSize = queue.length;
        pickFamily = family;
      }
    }
    if (!pickFamily) {
      for (const [family, queue] of queues) {
        if (!queue.length) continue;
        if (queue.length > pickSize) {
          pickSize = queue.length;
          pickFamily = family;
        }
      }
    }
    if (!pickFamily) break;
    result.push(queues.get(pickFamily)!.shift()!);
    lastFamily = pickFamily;
  }
  return result;
}

export function isSolidsCollectionHandle(handle: string): boolean {
  return handle === SOLIDS_COLLECTION_HANDLE;
}
