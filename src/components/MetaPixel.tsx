"use client";

import { useEffect } from "react";
import { canTrackForCategory } from "@/lib/tracking-consent";
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
  };
}

export function trackMetaEvent(name: string, params: MetaContent) {
  if (!shouldTrackMarketing()) return;
  void loadFbq().then(() => window.fbq?.("track", name, normalizeMetaContent(params)));
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

/** Mount once near the app root — deferred, consent-gated Meta Pixel loader. */
export default function MetaPixel() {
  useEffect(() => {
    scheduleFbqLoad();
  }, []);
  return null;
}
