"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { canTrackForCategory, subscribeConsent } from "@/lib/tracking-consent";
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
  item_list_id?: string;
  item_list_name?: string;
  index?: number;
  price?: number;
  quantity?: number;
};

type ConsentSignals = {
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  analytics_storage: "granted" | "denied";
};

function currentConsentSignals(): ConsentSignals {
  const marketing = canTrackForCategory("marketing") ? "granted" : "denied";
  const analytics = canTrackForCategory("analytics") ? "granted" : "denied";
  return {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    analytics_storage: analytics,
  };
}

let gtagLoadPromise: Promise<void> | null = null;
let gtagQueueReady = false;

function ensureGtagStub() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }
}

/**
 * Queues consent defaults and the GA4 config into `dataLayer` without any
 * network request. gtag.js replays the queue whenever it is finally fetched,
 * so events recorded before the deferred load are not lost.
 */
function initGtagQueue() {
  if (typeof window === "undefined" || gtagQueueReady) return;
  gtagQueueReady = true;
  ensureGtagStub();

  // Consent Mode v2 defaults must be queued before gtag.js executes.
  window.gtag!("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });
  window.gtag!("consent", "update", currentConsentSignals());

  window.gtag!("js", new Date());
  window.gtag!("config", GA_MEASUREMENT_ID, {
    // Page views are emitted manually so App Router navigations are counted.
    send_page_view: false,
    transport_type: "beacon",
    allow_google_signals: canTrackForCategory("marketing"),
  });
}

function loadGtag(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (gtagLoadPromise) return gtagLoadPromise;

  gtagLoadPromise = new Promise((resolve) => {
    initGtagQueue();

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

  return gtagLoadPromise;
}

/** Push a Consent Mode v2 update without forcing gtag.js to download. */
export function syncGoogleConsent() {
  if (typeof window === "undefined") return;
  ensureGtagStub();
  window.gtag!("consent", "update", currentConsentSignals());
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
  initGtagQueue();
  // Page views only queue; every other event is a conversion signal worth
  // flushing immediately in case the visitor navigates away (e.g. to checkout).
  if (name !== "page_view") void loadGtag();
  window.gtag?.("event", name, params);
}

export function trackPageView(path: string, title?: string) {
  trackGaEvent("page_view", {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: title ?? document.title,
  });
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

export function trackViewItemList(items: GaItem[], listId: string, listName: string) {
  if (!items.length) return;
  trackGaEvent("view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items: items.map((item, index) => ({
      ...normalizeGaItem(item),
      index,
      item_list_id: listId,
      item_list_name: listName,
    })),
  });
}

export function trackSelectItem(item: GaItem, listId: string, listName: string) {
  trackGaEvent("select_item", {
    item_list_id: listId,
    item_list_name: listName,
    items: [{ ...normalizeGaItem(item), item_list_id: listId, item_list_name: listName }],
  });
}

export function trackSearch(searchTerm: string, resultCount?: number) {
  if (!searchTerm.trim()) return;
  trackGaEvent("search", {
    search_term: searchTerm,
    ...(typeof resultCount === "number" ? { number_of_results: resultCount } : {}),
  });
}

export function trackGenerateLead(method: string, value = 0, currency = "USD") {
  trackGaEvent("generate_lead", { currency, value, method });
}

export function trackSignUp(method: string) {
  trackGaEvent("sign_up", { method });
}

export function trackLogin(method: string) {
  trackGaEvent("login", { method });
}

export function cartToGaItems(cart: Cart): GaItem[] {
  return cart.lines.nodes.map((line) => ({
    item_id: gidTail(line.merchandise.id),
    item_name: line.merchandise.product.title,
    item_variant: line.merchandise.title,
    item_brand: line.merchandise.product.vendor || undefined,
    item_category: line.merchandise.product.productType || undefined,
    price: Number(line.cost.amountPerQuantity.amount),
    quantity: line.quantity,
  }));
}

/** Mount once near the app root — deferred, consent-gated GA4 loader. */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    scheduleGtagLoad();
    return subscribeConsent(() => {
      syncGoogleConsent();
      if (shouldTrackAnalytics()) void loadGtag();
    });
  }, []);

  useEffect(() => {
    const path = `${pathname}${window.location.search}`;
    if (lastPath.current === path) return;
    lastPath.current = path;
    trackPageView(path);
  }, [pathname]);

  return null;
}
