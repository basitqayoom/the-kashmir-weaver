"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getCartUiServerSnapshot,
  getCartUiSnapshot,
  subscribeCartUi,
} from "@/lib/cart-ui";

export const COLLECTION_PRODUCTS_ID = "collection-products";

function scrollToProducts() {
  document.getElementById(COLLECTION_PRODUCTS_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function useCartQuantity(): number {
  const { cart } = useSyncExternalStore(
    subscribeCartUi,
    getCartUiSnapshot,
    getCartUiServerSnapshot,
  );
  return cart?.totalQuantity ?? 0;
}

/** Hides once the products grid enters the viewport. Shifts left when the FAB speed dial is open. */
export default function CollectionProductsScrollCue() {
  const [visible, setVisible] = useState(true);
  const cartQuantity = useCartQuantity();
  const bagOpen = cartQuantity > 0;

  useEffect(() => {
    const products = document.getElementById(COLLECTION_PRODUCTS_ID);
    if (!products) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(false);
      },
      { threshold: 0 },
    );

    observer.observe(products);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToProducts}
      aria-label="View products in this collection"
      className={`fixed left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-500 md:gap-2 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      } ${bagOpen ? "max-md:-translate-x-[calc(50%+2.75rem)]" : ""}`}
      style={{
        bottom: bagOpen
          ? "calc(5.5rem + env(safe-area-inset-bottom))"
          : "calc(1.5rem + env(safe-area-inset-bottom))",
      }}
    >
      <span className="font-accent text-[0.6rem] uppercase tracking-[0.2em] text-charcoal/70 md:text-[0.65rem]">
        View Products
      </span>
      <span className="flex h-10 w-10 items-center justify-center">
        <svg
          className="h-5 w-5 animate-swipe-up text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 19.5v-15m0 0-6.75 6.75M12 4.5 18.75 11.25"
          />
        </svg>
      </span>
    </button>
  );
}
