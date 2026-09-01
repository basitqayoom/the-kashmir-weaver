import { createHash } from "node:crypto";

const GRAPH_API_VERSION = "v21.0";

/**
 * Events the browser is allowed to mirror server-side. Anything else is
 * rejected so the public endpoint cannot be used to inject arbitrary
 * conversions into the ad account.
 */
export const CAPI_ALLOWED_EVENTS = [
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Search",
  "Lead",
  "CompleteRegistration",
] as const;

export type CapiEventName = (typeof CAPI_ALLOWED_EVENTS)[number] | "Purchase";

export type CapiCustomData = {
  content_ids?: string[];
  content_type?: "product";
  content_name?: string;
  content_category?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  value?: number;
  currency?: string;
  num_items?: number;
  search_string?: string;
  order_id?: string;
};

export type CapiUserSignals = {
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  zip?: string;
};

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** The pixel ID is public, so reuse the storefront one rather than duplicating it. */
function capiPixelId(): string | undefined {
  return process.env.META_PIXEL_ID || process.env.PUBLIC_META_PIXEL_ID;
}

export function isCapiConfigured(): boolean {
  return Boolean(process.env.META_CAPI_ACCESS_TOKEN && capiPixelId());
}

/**
 * Sends one server-side event to Meta. `eventId` must be the exact ID the
 * browser pixel used for the same action, otherwise Meta counts it twice.
 */
export async function sendCapiEvent(options: {
  eventName: CapiEventName;
  eventId: string;
  eventSourceUrl: string;
  customData: CapiCustomData;
  user: CapiUserSignals;
}): Promise<{ ok: boolean; status: number }> {
  const pixelId = capiPixelId();
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return { ok: false, status: 503 };

  const userData: Record<string, unknown> = {};
  if (options.user.clientIpAddress) userData.client_ip_address = options.user.clientIpAddress;
  if (options.user.clientUserAgent) userData.client_user_agent = options.user.clientUserAgent;
  if (options.user.fbp) userData.fbp = options.user.fbp;
  if (options.user.fbc) userData.fbc = options.user.fbc;
  if (options.user.email) userData.em = [sha256(options.user.email)];
  if (options.user.phone) {
    userData.ph = [sha256(options.user.phone.replace(/[^\d]/g, ""))];
  }
  if (options.user.firstName) userData.fn = [sha256(options.user.firstName)];
  if (options.user.lastName) userData.ln = [sha256(options.user.lastName)];
  if (options.user.city) userData.ct = [sha256(options.user.city.replace(/\s/g, ""))];
  if (options.user.country) userData.country = [sha256(options.user.country)];
  if (options.user.zip) userData.zp = [sha256(options.user.zip.replace(/\s/g, ""))];

  const body = {
    data: [
      {
        event_name: options.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: options.eventId,
        event_source_url: options.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: options.customData,
      },
    ],
    ...(process.env.META_CAPI_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE }
      : {}),
  };

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  return { ok: res.ok, status: res.status };
}
