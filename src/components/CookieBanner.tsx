"use client";

import { useState, useEffect, useRef } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      btnRef.current?.focus();
    }
  }, [visible]);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="alertdialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-banner-text"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-ivory/10 bg-charcoal/95 px-4 py-4 backdrop-blur-md sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p id="cookie-banner-text" className="text-xs text-ivory/70 sm:text-sm">
          We use cookies to improve your experience.{" "}
          <a href="/privacy" className="text-gold underline hover:text-gold-muted">
            Privacy Policy
          </a>
        </p>
        <button
          ref={btnRef}
          onClick={accept}
          className="rounded-full bg-gold px-6 py-2 text-xs font-semibold text-charcoal transition-colors hover:bg-gold-muted sm:text-sm"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
