import { getColourStudioProduct } from "@/lib/shopify/products";
import ColourStudioTeaser from "./ColourStudioTeaser";

/** Home section for the single solid product with the colour studio enabled. */
export default async function HomeColourStudio() {
  const found = await getColourStudioProduct().catch(() => null);
  if (!found) return null;

  return (
    <ColourStudioTeaser
      shades={found.shades}
      productTitle={found.product.title}
      productHref={`/products/${found.product.handle}`}
      shadeCount={Math.floor(found.shades.length / 10) * 10}
    />
  );
}
