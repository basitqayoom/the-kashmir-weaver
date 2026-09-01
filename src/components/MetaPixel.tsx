"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { canTrackForCategory, subscribeConsent } from "@/lib/tracking-consent";
import { gidTail } from "@/lib/tracking-ids";

/** Meta Pixel — Events Manager. Same pixel ID as hydrogen-the-kashmir-weaver. */
export const META_PIXEL_ID = "1724382275473712";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export type MetaContent = {
  content_ids: string[];
  content_type: "product";
  content_name?: string;
  content_category?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  value?: number;
  currency?: string;
  num_items?: number;
};

let fbqLoadPromise: Promise<void> | null = null;

function loadFbq(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (fbqLoadPromise) return fbqLoadPromise;
  if (typeof window.fbq === "function") return Promise.resolve();

  fbqLoadPromise = new Promise((resolve) => {
    const fbq: Fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);

    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
  });

  return fbqLoadPromise;
}

function isPrimaryStorefrontHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "thekashmirweaver.com" || host === "www.thekashmirweaver.com";
}

function shouldTrackMarketing(): boolean {
  if (typeof window === "undefined") return false;
  return isPrimaryStorefrontHost(window.location.hostname) && canTrackForCategory("marketing");
}

function scheduleFbqLoad() {
  const run = () => {
    if (shouldTrackMarketing()) void loadFbq();
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

function normalizeMetaContent(content: MetaContent): MetaContent {
  return {
    ...content,
    content_ids: content.content_ids.map((id) => gidTail(id)).filter(Boolean),
    ...(content.contents
      ? {
          contents: content.contents.map((entry) => ({
            ...entry,
            id: gidTail(entry.id) || entry.id,
          })),
        }
      : {}),
  };
}

/** Stable per-event ID shared with the Conversions API so Meta deduplicates. */
function makeEventId(name: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${name}.${random}`;
}

/**
 * Server-side twin of the browser event. Identity signals (IP, user agent,
 * _fbp/_fbc) are read from the request server-side, so only catalogue data is
 * sent here. Uses sendBeacon where possible to survive a checkout navigation.
 */
function mirrorToCapi(
  eventName: string,
  eventId: string,
  customData: Record<string, unknown>,
) {
  const body = JSON.stringify({
    eventName,
    eventId,
    path: `${window.location.pathname}${window.location.search}`,
    customData,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/meta-capi", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* analytics must never break the page */
  });
}

export function trackMetaEvent(name: string, params: MetaContent) {
  if (!shouldTrackMarketing()) return;
  void loadFbq();
  const eventId = makeEventId(name);
  const normalized = normalizeMetaContent(params);
  window.fbq?.("track", name, normalized, { eventID: eventId });
  mirrorToCapi(name, eventId, normalized as unknown as Record<string, unknown>);
}

/** Non-catalogue standard events (Search, Lead, CompleteRegistration). */
export function trackMetaSignal(name: string, params: Record<string, unknown> = {}) {
  if (!shouldTrackMarketing()) return;
  void loadFbq();
  const eventId = makeEventId(name);
  window.fbq?.("track", name, params, { eventID: eventId });
  mirrorToCapi(name, eventId, params);
}

export function trackMetaPageView() {
  if (!shouldTrackMarketing()) return;
  void loadFbq();
  window.fbq?.("track", "PageView");
}

export function trackViewContent(content: MetaContent) {
  trackMetaEvent("ViewContent", content);
}

export function trackAddToCartMeta(content: MetaContent) {
  trackMetaEvent("AddToCart", content);
}

export function trackInitiateCheckout(content: MetaContent) {
  trackMetaEvent("InitiateCheckout", content);
}

export function trackViewCartMeta(content: MetaContent) {
  trackMetaEvent("ViewCart", content);
}

export function trackSearchMeta(searchTerm: string, contentIds: string[] = []) {
  if (!searchTerm.trim()) return;
  trackMetaSignal("Search", {
    search_string: searchTerm,
    ...(contentIds.length
      ? { content_type: "product", content_ids: contentIds.map((id) => gidTail(id)) }
      : {}),
  });
}

export function trackLead(contentName: string, value = 0, currency = "USD") {
  trackMetaSignal("Lead", { content_name: contentName, value, currency });
}

export function trackCompleteRegistration(method: string) {
  trackMetaSignal("CompleteRegistration", { content_name: method, status: true });
}

/** Mount once near the app root — deferred, consent-gated Meta Pixel loader. */
export default function MetaPixel() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    scheduleFbqLoad();
    return subscribeConsent(() => {
      if (shouldTrackMarketing()) void loadFbq();
    });
  }, []);

  useEffect(() => {
    if (lastPath.current === null) {
      // The initial PageView is emitted by loadFbq() on init.
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackMetaPageView();
  }, [pathname]);

  return null;
}
