"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useSyncExternalStore } from "react";
import { canTrackForCategory, subscribeConsent } from "@/lib/tracking-consent";

function useAnalyticsConsent() {
  return useSyncExternalStore(
    subscribeConsent,
    () => canTrackForCategory("analytics"),
    () => false
  );
}

export default function ConsentGatedAnalytics() {
  const allowed = useAnalyticsConsent();
  if (!allowed) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
