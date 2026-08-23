import { siteConfig } from "@/config/site";

const OXYGEN_PREVIEW_HOST = /\.o2\.myshopify\.dev$/i;

export function resolveCheckoutUrl(
  checkoutUrl: string,
  checkoutDomain?: string | null,
): string {
  if (!checkoutUrl) return checkoutUrl;

  try {
    const url = new URL(checkoutUrl);
    const host = checkoutHost(checkoutDomain);

    if (host) {
      url.hostname = host;
    } else if (OXYGEN_PREVIEW_HOST.test(url.hostname)) {
      // PUBLIC_CHECKOUT_DOMAIN should be set for Oxygen preview hosts.
    }

    url.searchParams.delete("_cs");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function checkoutHost(checkoutDomain?: string | null): string | null {
  if (!checkoutDomain?.trim()) return null;
  return checkoutDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
}

export function toStorefrontCheckoutUrl(
  checkoutUrl: string,
  checkoutDomain?: string | null,
  locale = "en-us",
  storefrontUrl?: string | null,
): string {
  const normalized = resolveCheckoutUrl(checkoutUrl, checkoutDomain);

  try {
    const url = new URL(normalized);
    const tokenMatch = url.pathname.match(/\/cart\/c\/([^/]+)/);
    const host = checkoutHost(checkoutDomain) ?? url.hostname;
    const checkout = tokenMatch?.[1]
      ? new URL(`https://${host}/checkouts/cn/${tokenMatch[1]}/${locale}`)
      : new URL(normalized);

    url.searchParams.forEach((value, key) => {
      if (key !== "_cs") checkout.searchParams.set(key, value);
    });

    const origin = normalizeStorefrontOrigin(storefrontUrl ?? siteConfig.url);
    if (origin && !checkout.searchParams.has("return_url")) {
      checkout.searchParams.set("return_url", origin);
    }

    return checkout.toString();
  } catch {
    return normalized;
  }
}

function normalizeStorefrontOrigin(storefrontUrl?: string | null): string | null {
  if (!storefrontUrl?.trim()) return null;
  try {
    return new URL(storefrontUrl.trim()).origin;
  } catch {
    return null;
  }
}

export function normalizeCartCheckoutUrl(checkoutUrl: string): string {
  const domain = process.env.PUBLIC_CHECKOUT_DOMAIN ?? null;
  return toStorefrontCheckoutUrl(checkoutUrl, domain, "en-us", siteConfig.url);
}
