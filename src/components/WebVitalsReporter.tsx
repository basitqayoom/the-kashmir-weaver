"use client";

import { useEffect } from "react";
import { onCLS, onINP, onLCP, type Metric } from "web-vitals";
import { canTrackForCategory } from "@/lib/tracking-consent";

function isPrimaryStorefrontHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "thekashmirweaver.com" || host === "www.thekashmirweaver.com";
}

function shouldTrackWebVitals(): boolean {
  if (typeof window === "undefined") return false;
  return isPrimaryStorefrontHost(window.location.hostname) && canTrackForCategory("analytics");
}

function reportWebVital(metric: Metric) {
  if (!shouldTrackWebVitals()) return;

  window.dispatchEvent(
    new CustomEvent("tkw:web-vitals", {
      detail: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
      },
    }),
  );

  const gtag = window.gtag;
  if (typeof gtag !== "function") return;

  gtag("event", metric.name, {
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    event_category: "Web Vitals",
    event_label: metric.id,
    non_interaction: true,
  });
}

/** Reports CLS, INP, and LCP to GA4 — ported from hydrogen-the-kashmir-weaver. */
export default function WebVitalsReporter() {
  useEffect(() => {
    if (window.location.origin.includes("webcache.googleusercontent.com")) return;
    onCLS(reportWebVital);
    onINP(reportWebVital);
    onLCP(reportWebVital);
  }, []);

  return null;
}
