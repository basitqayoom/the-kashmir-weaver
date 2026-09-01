"use client";

import { reopenConsentBanner } from "@/lib/tracking-consent";

/** Lets visitors change a stored consent decision — required for valid consent. */
export default function CookiePreferencesLink() {
  return (
    <button
      type="button"
      onClick={reopenConsentBanner}
      className="transition-colors hover:text-gold"
    >
      Cookie Preferences
    </button>
  );
}
