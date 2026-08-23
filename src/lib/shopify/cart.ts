import { cookies } from "next/headers";
import { shopifyFetch } from "./client";
import {
  CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  CART_GIFT_CARD_CODES_ADD_MUTATION,
} from "./queries";
import type { Cart } from "./types";

const CART_COOKIE = "cart_id";

type CartMutationResult = {
  cart: Cart | null;
  userErrors: { field: string[] | null; message: string }[];
};

function assertNoUserErrors(result: CartMutationResult): Cart {
  if (result.userErrors.length > 0) {
    throw new Error(result.userErrors.map((e) => e.message).join(", "));
  }
  if (!result.cart) {
    throw new Error("Shopify did not return a cart");
  }
  return result.cart;
}

/** Safe to call from Server Components (read-only) and Server Actions. */
export async function getCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/** Only callable from a Server Action or Route Handler. */
async function persistCartId(id: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await getCartId();
  if (!cartId) return null;
  const data = await shopifyFetch<{ cart: Cart | null }>({
    query: CART_QUERY,
    variables: { cartId },
    revalidate: 0,
  });
  return data.cart;
}

/** Buy-now flow: add line(s) then return cart for checkout redirect. */
export async function buyNowLines(
  lines: {
    merchandiseId: string;
    quantity: number;
    attributes?: { key: string; value: string }[];
  }[],
  discountCodes: string[] = [],
): Promise<Cart> {
  const cartId = await getCartId();

  if (cartId) {
    try {
      const data = await shopifyFetch<{ cartLinesAdd: CartMutationResult }>({
        query: CART_LINES_ADD_MUTATION,
        variables: { cartId, lines },
        revalidate: 0,
      });
      let cart = assertNoUserErrors(data.cartLinesAdd);
      if (discountCodes.length) {
        cart = await updateCartDiscountCodes(discountCodes);
      }
      return cart;
    } catch {
      /* stale cart — fall through to create */
    }
  }

  const data = await shopifyFetch<{ cartCreate: CartMutationResult }>({
    query: CART_CREATE_MUTATION,
    variables: { lines },
    revalidate: 0,
  });
  let cart = assertNoUserErrors(data.cartCreate);
  await persistCartId(cart.id);
  if (discountCodes.length) {
    cart = await updateCartDiscountCodes(discountCodes);
  }
  return cart;
}

/** Adds a line, creating the cart on first use. Must run inside a Server Action. */
export async function addLineToCart(
  merchandiseId: string,
  quantity = 1,
  attributes?: { key: string; value: string }[],
): Promise<Cart> {
  const cartId = await getCartId();
  const line = {
    merchandiseId,
    quantity,
    ...(attributes?.length ? { attributes } : {}),
  };

  if (!cartId) {
    const data = await shopifyFetch<{ cartCreate: CartMutationResult }>({
      query: CART_CREATE_MUTATION,
      variables: { lines: [line] },
      revalidate: 0,
    });
    const cart = assertNoUserErrors(data.cartCreate);
    await persistCartId(cart.id);
    return cart;
  }

  const data = await shopifyFetch<{ cartLinesAdd: CartMutationResult }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines: [line] },
    revalidate: 0,
  });
  return assertNoUserErrors(data.cartLinesAdd);
}

export async function updateCartLine(
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) throw new Error("No active cart");
  const data = await shopifyFetch<{ cartLinesUpdate: CartMutationResult }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    revalidate: 0,
  });
  return assertNoUserErrors(data.cartLinesUpdate);
}

export async function removeCartLine(lineId: string): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) throw new Error("No active cart");
  const data = await shopifyFetch<{ cartLinesRemove: CartMutationResult }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
    revalidate: 0,
  });
  return assertNoUserErrors(data.cartLinesRemove);
}

/** Replaces the cart's full discount-code list (Shopify re-validates each code). */
export async function updateCartDiscountCodes(
  discountCodes: string[],
): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) throw new Error("No active cart");
  const data = await shopifyFetch<{
    cartDiscountCodesUpdate: CartMutationResult;
  }>({
    query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
    variables: { cartId, discountCodes },
    revalidate: 0,
  });
  return assertNoUserErrors(data.cartDiscountCodesUpdate);
}

/** Adds a gift card code to the cart (does not replace existing cards). */
export async function addGiftCardCode(code: string): Promise<Cart> {
  const trimmed = code.trim();
  if (!trimmed) throw new Error("Enter a gift card code");
  const cartId = await getCartId();
  if (!cartId) throw new Error("No active cart");
  const data = await shopifyFetch<{
    cartGiftCardCodesAdd: CartMutationResult;
  }>({
    query: CART_GIFT_CARD_CODES_ADD_MUTATION,
    variables: { cartId, giftCardCodes: [trimmed] },
    revalidate: 0,
  });
  return assertNoUserErrors(data.cartGiftCardCodesAdd);
}
