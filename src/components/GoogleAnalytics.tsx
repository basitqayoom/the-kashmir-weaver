"use client";

import { useEffect } from "react";
import { canTrackForCategory } from "@/lib/tracking-consent";
import { gidTail } from "@/lib/tracking-ids";
import type { Cart } from "@/lib/shopify/types";

/** GA4 property — same measurement ID as hydrogen-the-kashmir-weaver (cross-property comparability). */
export const GA_MEASUREMENT_ID = "G-2WQQF2JKTQ";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type GaItem = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  item_brand?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
};

let gtagLoadPromise: Promise<void> | null = null;

function loadGtag(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (gtagLoadPromise) return gtagLoadPromise;
  if (typeof window.gtag === "function") return Promise.resolve();

  gtagLoadPromise = new Promise((resolve) => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

  return gtagLoadPromise;
}

function isPrimaryStorefrontHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "thekashmirweaver.com" || host === "www.thekashmirweaver.com";
}

function shouldTrackAnalytics(): boolean {
  if (typeof window === "undefined") return false;
  return isPrimaryStorefrontHost(window.location.hostname) && canTrackForCategory("analytics");
}

function scheduleGtagLoad() {
  const run = () => {
    if (shouldTrackAnalytics()) void loadGtag();
  };

  const onInteract = () => {
    run();
    window.removeEventListener("pointerdown", onInteract);
    window.removeEventListener("keydown", onInteract);
    window.removeEventListener("scroll", onInteract);
  };
  window.addEventListener("pointerdown", onInteract, { once: true, passive: true });
  window.addEventListener("keydown", onInteract, { once: true });
  window.addEventListener("scroll", onInteract, { once: true, passive: true });

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 60000 });
  } else {
    window.setTimeout(run, 45000);
  }
}

export function trackGaEvent(name: string, params: Record<string, unknown>) {
  if (!shouldTrackAnalytics()) return;
  void loadGtag().then(() => window.gtag?.("event", name, params));
}

export function normalizeGaItem(item: GaItem): GaItem {
  return { ...item, item_id: gidTail(item.item_id) || item.item_id };
}

export function trackViewItem(item: GaItem, currency = "USD") {
  const normalized = normalizeGaItem(item);
  trackGaEvent("view_item", { currency, value: normalized.price, items: [normalized] });
}

export function trackAddToCart(item: GaItem, currency = "USD") {
  const normalized = normalizeGaItem(item);
  trackGaEvent("add_to_cart", {
    currency,
    value: (normalized.price ?? 0) * (normalized.quantity ?? 1),
    items: [normalized],
  });
}

export function trackRemoveFromCart(item: GaItem, currency = "USD") {
  const normalized = normalizeGaItem(item);
  trackGaEvent("remove_from_cart", {
    currency,
    value: (normalized.price ?? 0) * (normalized.quantity ?? 1),
    items: [normalized],
  });
}

export function trackViewCart(items: GaItem[], value: number, currency = "USD") {
  const normalized = items.map(normalizeGaItem);
  trackGaEvent("view_cart", { currency, value, items: normalized });
}

export function trackBeginCheckout(items: GaItem[], value: number, currency = "USD") {
  const normalized = items.map(normalizeGaItem);
  trackGaEvent("begin_checkout", { currency, value, items: normalized });
}

export function cartToGaItems(cart: Cart): GaItem[] {
  return cart.lines.nodes.map((line) => ({
    item_id: gidTail(line.merchandise.id),
    item_name: line.merchandise.product.title,
    item_variant: line.merchandise.title,
    price: Number(line.cost.amountPerQuantity.amount),
    quantity: line.quantity,
  }));
}

/** Mount once near the app root — deferred, consent-gated GA4 loader. */
export default function GoogleAnalytics() {
  useEffect(() => {
    scheduleGtagLoad();
  }, []);
  return null;
}
