export type ParsedSizeOption = {
  label: string;
  dimensions?: string;
};

/** Split "Stole (70 × 200 cm)" into a short label and dimensions line. */
export function parseSizeOptionValue(value: string): ParsedSizeOption {
  const match = value.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { label: value.trim() };
  return {
    label: match[1].trim(),
    dimensions: match[2].trim().replace(/\s*[xX×]\s*/g, " × "),
  };
}

export function isSizeOptionName(name: string): boolean {
  return /size/i.test(name);
}

export function isColorOptionName(name: string): boolean {
  return /colou?r/i.test(name);
}

/**
 * Shopify's placeholder option ("Title" / "Default Title") on products that
 * have no real variant options — never worth showing a picker for.
 */
export function isDefaultOption(option: {
  name: string;
  values: string[];
}): boolean {
  return (
    option.name.trim().toLowerCase() === "title" &&
    option.values.length === 1 &&
    option.values[0].trim().toLowerCase() === "default title"
  );
}

/** Friendly label for Shopify taxonomy names like "Accessory size". */
export function optionDisplayName(name: string): string {
  if (isSizeOptionName(name)) return "Size";
  if (isColorOptionName(name)) return "Colour";
  return name;
}

/** One-line label for option value buttons — size values get the dimensions stripped into a subline. */
export function formatOptionDisplay(value: string, sizeStyle = true): string {
  if (!sizeStyle) return value;
  const { label, dimensions } = parseSizeOptionValue(value);
  return dimensions ? `${label} — ${dimensions}` : label;
}

export function formatVariantWeight(
  weight?: number | null,
  weightUnit?: string | null,
): string | null {
  if (!weight || weight <= 0) return null;
  const unit = (weightUnit ?? "GRAMS").toLowerCase();
  if (unit === "grams" || unit === "g") return `${Math.round(weight)}g`;
  if (unit === "kilograms" || unit === "kg") return `${weight}kg`;
  if (unit === "ounces" || unit === "oz") return `${weight}oz`;
  if (unit === "pounds" || unit === "lb") return `${weight}lb`;
  return `${weight}${unit}`;
}
