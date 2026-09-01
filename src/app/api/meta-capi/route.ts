import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  CAPI_ALLOWED_EVENTS,
  isCapiConfigured,
  sendCapiEvent,
  type CapiCustomData,
} from "@/lib/meta-capi";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type MirrorableEvent = (typeof CAPI_ALLOWED_EVENTS)[number];

function isMirrorableEvent(name: string): name is MirrorableEvent {
  return (CAPI_ALLOWED_EVENTS as readonly string[]).includes(name);
}

const MAX_CONTENT_IDS = 50;
const MAX_STRING = 200;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function hostAllowed(rawUrl: string | null): boolean {
  if (!rawUrl) return false;
  try {
    const host = new URL(rawUrl).host;
    return host === new URL(siteConfig.url).host || host.startsWith("localhost:");
  } catch {
    return false;
  }
}

/** Safari omits `Origin` on same-origin POSTs, so fall back to fetch metadata. */
function sameOrigin(request: NextRequest): boolean {
  if (hostAllowed(request.headers.get("origin"))) return true;
  if (request.headers.get("sec-fetch-site") === "same-origin") return true;
  return hostAllowed(request.headers.get("referer"));
}

function str(value: unknown, max = MAX_STRING): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : undefined;
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

/** Whitelist-only projection — never forward raw client input to Meta. */
function sanitizeCustomData(input: unknown): CapiCustomData {
  const raw = (input ?? {}) as Record<string, unknown>;
  const ids = Array.isArray(raw.content_ids)
    ? raw.content_ids
        .map((id) => str(id, 64))
        .filter((id): id is string => Boolean(id))
        .slice(0, MAX_CONTENT_IDS)
    : undefined;

  const contents = Array.isArray(raw.contents)
    ? raw.contents
        .slice(0, MAX_CONTENT_IDS)
        .map((entry) => {
          const e = (entry ?? {}) as Record<string, unknown>;
          const id = str(e.id, 64);
          if (!id) return null;
          return {
            id,
            quantity: num(e.quantity) ?? 1,
            ...(num(e.item_price) !== undefined ? { item_price: num(e.item_price) } : {}),
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    : undefined;

  return {
    ...(ids?.length ? { content_ids: ids, content_type: "product" as const } : {}),
    ...(contents?.length ? { contents } : {}),
    ...(str(raw.content_name) ? { content_name: str(raw.content_name) } : {}),
    ...(str(raw.content_category) ? { content_category: str(raw.content_category) } : {}),
    ...(num(raw.value) !== undefined ? { value: num(raw.value) } : {}),
    ...(str(raw.currency, 3) ? { currency: str(raw.currency, 3) } : {}),
    ...(num(raw.num_items) !== undefined ? { num_items: num(raw.num_items) } : {}),
    ...(str(raw.search_string) ? { search_string: str(raw.search_string) } : {}),
  };
}

/**
 * Server half of the Meta pixel. The browser sends only the event name, the
 * shared `eventId` and catalogue data; identity signals (IP, UA, _fbp/_fbc)
 * are read here from the request so they cannot be spoofed by the caller.
 */
export async function POST(request: NextRequest) {
  if (!isCapiConfigured()) {
    return new NextResponse(null, { status: 204 });
  }
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventName = str(payload.eventName, 40);
  const eventId = str(payload.eventId, 100);
  // Purchase is deliberately excluded — it only comes from the signed order webhook.
  if (!eventName || !eventId || !isMirrorableEvent(eventName)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = str(payload.path, 300) ?? "/";
  const eventSourceUrl = `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;

  const result = await sendCapiEvent({
    eventName,
    eventId,
    eventSourceUrl,
    customData: sanitizeCustomData(payload.customData),
    user: {
      clientIpAddress: ip !== "unknown" ? ip : undefined,
      clientUserAgent: request.headers.get("user-agent") ?? undefined,
      fbp: request.cookies.get("_fbp")?.value,
      fbc: request.cookies.get("_fbc")?.value,
    },
  }).catch(() => ({ ok: false, status: 502 }));

  return NextResponse.json({ ok: result.ok }, { status: result.ok ? 202 : 502 });
}
