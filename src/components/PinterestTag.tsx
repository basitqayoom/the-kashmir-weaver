"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { canTrackForCategory, subscribeConsent } from "@/lib/tracking-consent";
import { gidTail } from "@/lib/tracking-ids";
import { siteConfig } from "@/config/site";

/** Pinterest Tag ID — same advertiser account as the verified domain claim. */
export const PINTEREST_TAG_ID = siteConfig.verification.pinterestTagId;

type Pintrk = ((...args: unknown[]) => void) & {
  queue: unknown[];
  version?: string;
};

declare global {
  interface Window {
    pintrk?: Pintrk;
  }
}

export type PinterestLineItem = {
  product_id: string;
  product_name?: string;
  product_price?: number;
  product_quantity?: number;
  product_category?: string;
  product_brand?: string;
};

let pintrkLoadPromise: Promise<void> | null = null;

function loadPintrk(): Promise<void> {
  if (typeof window === "undefined" || !PINTEREST_TAG_ID) return Promise.resolve();
  if (pintrkLoadPromise) return pintrkLoadPromise;

  pintrkLoadPromise = new Promise((resolve) => {
    const pintrk: Pintrk = function (...args: unknown[]) {
      pintrk.queue.push(args);
    } as Pintrk;
    pintrk.queue = [];
    pintrk.version = "3.0";
    window.pintrk = pintrk;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://s.pinimg.com/ct/core.js";
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);

    pintrk("load", PINTEREST_TAG_ID);
    pintrk("page");
  });

  return pintrkLoadPromise;
}

function isPrimaryStorefrontHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "thekashmirweaver.com" || host === "www.thekashmirweaver.com";
}

function shouldTrackPinterest(): boolean {
  if (typeof window === "undefined" || !PINTEREST_TAG_ID) return false;
  return isPrimaryStorefrontHost(window.location.hostname) && canTrackForCategory("marketing");
}

function schedulePintrkLoad() {
  const run = () => {
    if (shouldTrackPinterest()) void loadPintrk();
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

function normalizeLineItems(items: PinterestLineItem[]): PinterestLineItem[] {
  return items.map((item) => ({
    ...item,
    product_id: gidTail(item.product_id) || item.product_id,
  }));
}

export function trackPinterestEvent(name: string, params: Record<string, unknown> = {}) {
  if (!shouldTrackPinterest()) return;
  void loadPintrk();
  window.pintrk?.("track", name, params);
}

export function trackPinterestPageVisit(lineItems?: PinterestLineItem[]) {
  trackPinterestEvent(
    "pagevisit",
    lineItems?.length ? { line_items: normalizeLineItems(lineItems) } : {},
  );
}

export function trackPinterestAddToCart(
  lineItems: PinterestLineItem[],
  value: number,
  currency = "USD",
) {
  trackPinterestEvent("addtocart", {
    value,
    order_quantity: lineItems.reduce((sum, item) => sum + (item.product_quantity ?? 1), 0),
    currency,
    line_items: normalizeLineItems(lineItems),
  });
}

export function trackPinterestCheckout(
  lineItems: PinterestLineItem[],
  value: number,
  currency = "USD",
) {
  trackPinterestEvent("checkout", {
    value,
    order_quantity: lineItems.reduce((sum, item) => sum + (item.product_quantity ?? 1), 0),
    currency,
    line_items: normalizeLineItems(lineItems),
  });
}

export function trackPinterestSearch(searchQuery: string) {
  if (!searchQuery.trim()) return;
  trackPinterestEvent("search", { search_query: searchQuery });
}

export function trackPinterestLead(leadType: string) {
  trackPinterestEvent("lead", { lead_type: leadType });
}

/** Mount once near the app root — deferred, consent-gated Pinterest Tag loader. */
export default function PinterestTag() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    schedulePintrkLoad();
    return subscribeConsent(() => {
      if (shouldTrackPinterest()) void loadPintrk();
    });
  }, []);

  useEffect(() => {
    if (lastPath.current === null) {
      // The initial page event is emitted by loadPintrk() on init.
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (!shouldTrackPinterest()) return;
    void loadPintrk();
    window.pintrk?.("page");
  }, [pathname]);

  return null;
}
