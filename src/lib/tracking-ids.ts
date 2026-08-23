/** Numeric tail of a Shopify GID — required for Meta catalogue match. */
export function gidTail(id?: string | null): string {
  if (!id) return "";
  const parts = id.split("/");
  return parts[parts.length - 1] || id;
}
