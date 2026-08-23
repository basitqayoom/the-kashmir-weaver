/**
 * Client-side loader/cache for the same-origin /api/fx-rates proxy, plus the
 * pure conversion math. Mirrors Hydrogen's app/lib/fx-rates.ts so both
 * storefronts show the same approximate display prices.
 */

export type FxRates = {
  base: "USD";
  rates: Record<string, number>;
  fetchedAt: number;
};

const CACHE_MS = 1000 * 60 * 60; // 1 hour

const FALLBACK_RATES: FxRates = {
  base: "USD",
  rates: { USD: 1 },
  fetchedAt: 0,
};

let memoryCache: FxRates | null = null;
let inflight: Promise<FxRates> | null = null;

function isFxRates(value: unknown): value is FxRates {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.base === "USD" && typeof v.rates === "object" && v.rates !== null;
}

/** Fetches (and caches for an hour) live USD-based FX rates from our own API route. */
export async function loadUsdFxRates(): Promise<FxRates> {
  if (memoryCache && Date.now() - memoryCache.fetchedAt < CACHE_MS) {
    return memoryCache;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch("/api/fx-rates", {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data: unknown = await res.json();
        if (isFxRates(data) && Object.keys(data.rates).length > 1) {
          memoryCache = data;
          return data;
        }
      }
    } catch {
      // fall through to cache / fallback
    }
    return memoryCache ?? FALLBACK_RATES;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/** Converts an amount between two ISO currency codes using "1 USD = X currency" rates. */
export function convertAmount(
  amount: number,
  fromCode: string,
  toCode: string,
  rates: Record<string, number>,
): number {
  const from = fromCode.toUpperCase();
  const to = toCode.toUpperCase();
  if (!Number.isFinite(amount) || from === to) return amount;

  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return amount;

  const inUsd = from === "USD" ? amount : amount / fromRate;
  return to === "USD" ? inUsd : inUsd * toRate;
}
