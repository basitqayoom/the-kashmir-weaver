"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  acceptAllConsent,
  getConsentState,
  rejectAllConsent,
  saveConsentPreferences,
  subscribeConsent,
  type ConsentPreferences,
} from "@/lib/tracking-consent";

function subscribe(callback: () => void) {
  return subscribeConsent(callback);
}

function getSnapshot() {
  return getConsentState() === "pending";
}

function getServerSnapshot() {
  return false;
}

export default function CookieBanner() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [showManage, setShowManage] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences>({ analytics: true, marketing: true });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (visible) {
      btnRef.current?.focus();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="alertdialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-banner-text"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-ivory/10 bg-charcoal/95 px-4 py-4 backdrop-blur-md sm:px-6"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-7xl">
        {showManage ? (
          <div className="flex flex-col gap-4">
            <p className="font-heading text-sm font-semibold text-ivory">Manage preferences</p>
            <label className="flex items-center gap-3 text-sm text-ivory/80">
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                className="h-4 w-4 accent-gold"
              />
              Analytics (helps us understand site usage)
            </label>
            <label className="flex items-center gap-3 text-sm text-ivory/80">
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                className="h-4 w-4 accent-gold"
              />
              Marketing (personalised ads and remarketing)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  saveConsentPreferences(prefs);
                  setShowManage(false);
                }}
                className="font-accent bg-gold px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={() => setShowManage(false)}
                className="font-accent border border-ivory/30 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ivory/80"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p id="cookie-banner-text" className="text-xs text-ivory/70 sm:text-sm">
              We use cookies for analytics and marketing to improve your experience.{" "}
              <a href="/privacy" className="text-gold underline hover:text-gold-muted">
                Privacy Policy
              </a>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                ref={btnRef}
                type="button"
                onClick={acceptAllConsent}
                className="font-accent bg-gold px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-gold-dark"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={rejectAllConsent}
                className="font-accent border border-ivory/30 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ivory/80 transition-colors hover:border-ivory/50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => setShowManage(true)}
                className="font-accent px-3 py-2.5 text-[11px] font-light uppercase tracking-[0.15em] text-ivory/60 underline-offset-2 hover:text-ivory hover:underline"
              >
                Manage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
