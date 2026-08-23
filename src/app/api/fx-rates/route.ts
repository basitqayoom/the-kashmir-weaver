import { NextResponse } from "next/server";

// Rates don't depend on the request — let Next.js's data cache reuse one
// upstream fetch across all visitors for 30 minutes instead of hitting the
// external API (and re-running this handler) on every request.
export const revalidate = 1800;

type OpenErApiResponse = { result?: string; rates?: Record<string, number> };
type CurrencyApiCdnResponse = { usd?: Record<string, number> };

async function fetchOpenErApi(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data: OpenErApiResponse = await res.json();
    if (data.result !== "success" || !data.rates) return null;
    return data.rates;
  } catch {
    return null;
  }
}

async function fetchCurrencyApiCdn(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data: CurrencyApiCdnResponse = await res.json();
    if (!data.usd) return null;
    // This provider's rates are lowercase currency codes and fractional (1 usd = X).
    const rates: Record<string, number> = {};
    for (const [code, rate] of Object.entries(data.usd)) {
      rates[code.toUpperCase()] = rate;
    }
    return rates;
  } catch {
    return null;
  }
}

/** Same-origin FX-rate proxy — mirrors Hydrogen's api.fx-rates.tsx (primary + CDN fallback). */
export async function GET() {
  const primary = await fetchOpenErApi();
  const rates = primary ?? (await fetchCurrencyApiCdn());

  if (rates) {
    return NextResponse.json(
      { base: "USD", rates: { ...rates, USD: 1 }, fetchedAt: Date.now() },
      { headers: { "Cache-Control": "public, max-age=1800" } },
    );
  }

  return NextResponse.json(
    { base: "USD", rates: { USD: 1 }, fetchedAt: 0 },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
