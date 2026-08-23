export type ProductAccordionItem = { title: string; body: string };
export type ProductBulletItem = { text: string; href?: string };

function parseJsonArray(value: string | null | undefined): unknown[] | null {
  if (!value?.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** `custom.guarantees_delivery` — a JSON list of `{ title, body }` entries. */
export function parseAccordionItems(
  value: string | null | undefined,
): ProductAccordionItem[] {
  const parsed = parseJsonArray(value);
  if (!parsed) return [];
  return parsed.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const { title, body } = entry as { title?: unknown; body?: unknown };
    if (typeof title !== "string" || !title.trim()) return [];
    return [{ title: title.trim(), body: typeof body === "string" ? body.trim() : "" }];
  });
}

/** `custom.returns_care` — a JSON list of `{ text, href? }` entries. */
export function parseBulletItems(
  value: string | null | undefined,
): ProductBulletItem[] {
  const parsed = parseJsonArray(value);
  if (!parsed) return [];
  return parsed.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const { text, href } = entry as { text?: unknown; href?: unknown };
    if (typeof text !== "string" || !text.trim()) return [];
    const trimmedHref = typeof href === "string" && href.trim() ? href.trim() : undefined;
    return [{ text: text.trim(), ...(trimmedHref ? { href: trimmedHref } : {}) }];
  });
}

/**
 * Metafields typed as `list.single_line_text_field` arrive as a JSON array
 * string; plain text fields arrive as-is. Render either as paragraphs.
 */
export function parseTextBlocks(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  const parsed = parseJsonArray(value);
  if (parsed) {
    return parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  }
  return [value.trim()];
}
