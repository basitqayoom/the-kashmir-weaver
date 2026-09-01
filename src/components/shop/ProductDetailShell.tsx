"use client";

import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import type { ProductDetail, StorefrontImage } from "@/lib/shopify/types";
import {
  findShadeByCode,
  getDefaultShadeCode,
  getProductShades,
  productUsesColourStudio,
} from "@/lib/shopify/colour-studio";
import { isColorOptionName } from "@/lib/shopify/parse-size-option";
import ProductDetails from "./ProductDetails";
import ProductGallery from "./ProductGallery";
import VariantPicker from "./VariantPicker";
import { siteConfig, whatsappLink } from "@/config/site";

// Avoids a visible-then-reset flash from a same-tick setState in a plain effect.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Prefer the variant image; otherwise match gallery media by colour name in alt/url. */
function resolveColourImages(
  images: StorefrontImage[],
  selected: Record<string, string>,
  variantImage: StorefrontImage | null | undefined,
): StorefrontImage[] {
  if (variantImage) {
    return [
      variantImage,
      ...images.filter((img) => img.url !== variantImage.url),
    ];
  }

  const colourValue = Object.entries(selected).find(([name]) =>
    isColorOptionName(name),
  )?.[1]?.trim();
  if (!colourValue || images.length < 2) return images;

  const needle = colourValue.toLowerCase();
  const matchIdx = images.findIndex((img) => {
    const haystack = `${img.altText ?? ""} ${img.url}`.toLowerCase();
    return haystack.includes(needle);
  });
  if (matchIdx <= 0) return images;

  const matched = images[matchIdx]!;
  return [matched, ...images.filter((_, i) => i !== matchIdx)];
}

export default function ProductDetailShell({
  product,
  images,
  children,
}: {
  product: ProductDetail;
  images: StorefrontImage[];
  children: ReactNode;
}) {
  const variants = product.variants.nodes;
  const productShades = useMemo(() => getProductShades(product), [product]);
  const usesColourStudio = productUsesColourStudio(product);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.options.forEach((opt) => {
      initial[opt.name] = opt.values[0];
    });
    return initial;
  });

  const [selectedShadeCode, setSelectedShadeCode] = useState(() =>
    getDefaultShadeCode(productShades),
  );

  // The `?shadeCode=` deep link from the home Colour Studio is applied after
  // hydration rather than read on the server, so this page stays static.
  useIsomorphicLayoutEffect(() => {
    const fromLink = new URLSearchParams(window.location.search)
      .get("shadeCode")
      ?.trim();
    if (fromLink && findShadeByCode(productShades, fromLink)) {
      setSelectedShadeCode(fromLink);
    }
  }, [productShades]);

  const selectedShade = useMemo(
    () =>
      findShadeByCode(productShades, selectedShadeCode) ??
      productShades[0] ??
      null,
    [productShades, selectedShadeCode],
  );

  const matchedVariant = useMemo(
    () =>
      variants.find((v) =>
        v.selectedOptions.every((o) => selected[o.name] === o.value),
      ) ?? null,
    [variants, selected],
  );

  const displayImages = useMemo(
    () => resolveColourImages(images, selected, matchedVariant?.image),
    [images, selected, matchedVariant],
  );

  const [galleryKey, setGalleryKey] = useState(matchedVariant?.id ?? product.id);

  useIsomorphicLayoutEffect(() => {
    setGalleryKey(matchedVariant?.id ?? product.id);
  }, [matchedVariant?.id, product.id]);

  return (
      <>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <ProductGallery
          key={galleryKey}
          images={displayImages}
          title={product.title}
          colourPreview={usesColourStudio ? selectedShade : null}
          requestMoreImagesUrl={
            product.requestMoreImages?.value === "true"
              ? whatsappLink(siteConfig.whatsappMessages.product(product.title))
              : undefined
          }
        />
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        {children}
        <div className="mt-6">
          <VariantPicker
            product={product}
            selected={selected}
            onSelectedChange={setSelected}
            selectedShadeCode={selectedShadeCode}
            onShadeCodeChange={setSelectedShadeCode}
          />
        </div>
      </div>
    </div>
      <ProductDetails product={product} selectedVariant={matchedVariant} />
      </>
  );
}
