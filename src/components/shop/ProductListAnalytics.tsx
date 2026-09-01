"use client";

import { useEffect, useRef } from "react";
import { trackViewItemList, type GaItem } from "@/components/GoogleAnalytics";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

export function productsToGaItems(products: ProductCardType[]): GaItem[] {
  return products.map((product) => ({
    item_id: product.id,
    item_name: product.title,
    item_brand: product.vendor,
    item_category: product.productType,
    price: Number(product.priceRange.minVariantPrice.amount),
  }));
}

/**
 * Fires GA4 `view_item_list` once per rendered list. Renders nothing —
 * drop it beside any product grid to attribute merchandising performance.
 */
export default function ProductListAnalytics({
  products,
  listId,
  listName,
}: {
  products: ProductCardType[];
  listId: string;
  listName: string;
}) {
  const sentSignature = useRef<string | null>(null);

  useEffect(() => {
    if (!products.length) return;
    const signature = `${listId}:${products.map((product) => product.id).join(",")}`;
    if (sentSignature.current === signature) return;
    sentSignature.current = signature;
    trackViewItemList(productsToGaItems(products), listId, listName);
  }, [products, listId, listName]);

  return null;
}
