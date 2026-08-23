const CONSENT_KEY = "cookie-consent";

export type ConsentCategory = "analytics" | "marketing";

export type ConsentState = "pending" | "accepted" | "rejected";

export type ConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
};

function readState(): ConsentState {
  if (typeof window === "undefined") return "pending";
  const raw = localStorage.getItem(CONSENT_KEY);
  if (raw === "accepted") return "accepted";
  if (raw === "rejected") return "rejected";
  return "pending";
}

function readPreferences(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${CONSENT_KEY}-prefs`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getConsentState(): ConsentState {
  return readState();
}

export function hasConsentDecision(): boolean {
  const state = readState();
  return state === "accepted" || state === "rejected";
}

/** Legacy helper — true when analytics consent granted. */
export function canTrack(): boolean {
  return canTrackForCategory("analytics");
}

export function canTrackForCategory(category: ConsentCategory): boolean {
  if (typeof window === "undefined") return false;

  const state = readState();
  const prefs = readPreferences();

  if (prefs) {
    return category === "analytics" ? prefs.analytics : prefs.marketing;
  }

  if (state === "accepted") return true;
  if (state === "rejected") return false;
  return false;
}

export function acceptAllConsent(): void {
  localStorage.setItem(CONSENT_KEY, "accepted");
  localStorage.setItem(
    `${CONSENT_KEY}-prefs`,
    JSON.stringify({ analytics: true, marketing: true } satisfies ConsentPreferences)
  );
  notifyConsentChange();
}

export function rejectAllConsent(): void {
  localStorage.setItem(CONSENT_KEY, "rejected");
  localStorage.setItem(
    `${CONSENT_KEY}-prefs`,
    JSON.stringify({ analytics: false, marketing: false } satisfies ConsentPreferences)
  );
  notifyConsentChange();
}

export function saveConsentPreferences(prefs: ConsentPreferences): void {
  const anyGranted = prefs.analytics || prefs.marketing;
  localStorage.setItem(CONSENT_KEY, anyGranted ? "accepted" : "rejected");
  localStorage.setItem(`${CONSENT_KEY}-prefs`, JSON.stringify(prefs));
  notifyConsentChange();
}

const listeners = new Set<() => void>();

export function subscribeConsent(callback: () => void): () => void {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function notifyConsentChange() {
  listeners.forEach((listener) => listener());
}
