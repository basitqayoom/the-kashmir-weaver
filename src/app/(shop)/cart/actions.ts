"use server";

import { revalidatePath } from "next/cache";
import {
  addLineToCart,
  getCart,
  removeCartLine,
  updateCartDiscountCodes,
  addGiftCardCode,
  updateCartLine,
} from "@/lib/shopify/cart";
import type { Cart } from "@/lib/shopify/types";

export async function addToCartAction(
  merchandiseId: string,
  quantity: number = 1,
  attributes?: { key: string; value: string }[],
) {
  await addLineToCart(merchandiseId, quantity, attributes);
  revalidatePath("/cart");
}

export async function updateCartLineAction(lineId: string, quantity: number) {
  if (quantity <= 0) {
    await removeCartLine(lineId);
  } else {
    await updateCartLine(lineId, quantity);
  }
  revalidatePath("/cart");
}

export async function removeCartLineAction(lineId: string) {
  await removeCartLine(lineId);
  revalidatePath("/cart");
}

/** Adds a promo code to whatever is already applicable (stale rejected codes are dropped, not resubmitted). */
export async function applyDiscountCodeAction(code: string): Promise<Cart> {
  const trimmed = code.trim();
  if (!trimmed) throw new Error("Enter a promo code");
  const current = await getCart();
  const existing =
    current?.discountCodes.filter((d) => d.applicable).map((d) => d.code) ?? [];
  const next = existing.includes(trimmed) ? existing : [...existing, trimmed];
  const cart = await updateCartDiscountCodes(next);
  revalidatePath("/cart");
  return cart;
}

export async function removeDiscountCodeAction(code: string): Promise<Cart> {
  const current = await getCart();
  const next = (current?.discountCodes.map((d) => d.code) ?? []).filter(
    (c) => c !== code,
  );
  const cart = await updateCartDiscountCodes(next);
  revalidatePath("/cart");
  return cart;
}

export async function applyGiftCardAction(code: string): Promise<Cart> {
  const cart = await addGiftCardCode(code);
  revalidatePath("/cart");
  return cart;
}
