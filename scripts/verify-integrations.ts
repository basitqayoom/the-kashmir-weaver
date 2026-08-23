/**
 * End-to-end integration health check (Merchant, sales channel, GSC, build).
 *
 * Usage: npm run integrations:verify
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  googleContentToken,
  googleWebmastersToken,
} from "../../hydrogen-the-kashmir-weaver/scripts/lib/google-auth.ts";

const ROOT = resolve(import.meta.dirname, "..");
const HYDROGEN = resolve(ROOT, "../hydrogen-the-kashmir-weaver");
const CREDS =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  resolve(HYDROGEN, "secrets/google/merchant-service-account.json");

function loadEnv(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv(resolve(ROOT, ".env.local"));
loadEnv(resolve(HYDROGEN, ".env"));

const SHOP = process.env.PUBLIC_STORE_DOMAIN!;
const STOREFRONT = process.env.PUBLIC_STOREFRONT_API_TOKEN!;
const ADMIN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const MERCHANT = process.env.MERCHANT_ID || "5825882191";
const STORE = (process.env.PUBLIC_STORE_URL || "https://thekashmirweaver.com").replace(/\/$/, "");

async function adminGql(query: string) {
  const res = await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN,
    },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

async function storefrontCount() {
  const res = await fetch(`https://${SHOP}/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT,
    },
    body: JSON.stringify({
      query: `{ products(first: 1) { pageInfo { hasNextPage } nodes { id } } }`,
    }),
  });
  const json = await res.json();
  return json.errors ? 0 : 1;
}

type Check = { name: string; ok: boolean; detail: string };

async function main() {
  const checks: Check[] = [];

  checks.push({
    name: "Store URL env",
    ok: STORE.includes("thekashmirweaver.com"),
    detail: STORE,
  });

  if (STOREFRONT && SHOP) {
    const hasProducts = await storefrontCount();
    checks.push({
      name: "Headless sales channel (Storefront API)",
      ok: hasProducts === 1,
      detail: hasProducts ? "Products reachable" : "No products / API error",
    });
  } else {
    checks.push({
      name: "Headless sales channel (Storefront API)",
      ok: false,
      detail: "Missing storefront token or shop domain",
    });
  }

  if (ADMIN && SHOP) {
    const pub = await adminGql(`{
      publications(first: 10) { nodes { name } }
    }`);
    const names = (pub.data?.publications?.nodes || []).map((n: { name: string }) => n.name);
    checks.push({
      name: "Sales channel publication",
      ok: names.includes("The Kashmir Weaver"),
      detail: names.join(", ") || "none",
    });
  }

  try {
    let items: Array<{ link?: string; canonicalLink?: string }> = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const token = await googleContentToken(CREDS);
        const res = await fetch(
          `https://shoppingcontent.googleapis.com/content/v2.1/${MERCHANT}/products?maxResults=250`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await res.json();
        items = json.resources || [];
        break;
      } catch (e) {
        if (attempt === 2) throw e;
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
    const shopCanonical = items.filter((p: { canonicalLink?: string }) =>
      (p.canonicalLink || "").includes("thekashmirweaver.shop"),
    ).length;
    const comCanonical = items.filter((p: { canonicalLink?: string }) =>
      (p.canonicalLink || "").includes("thekashmirweaver.com"),
    ).length;
    const shopLinkOnly = items.filter(
      (p: { link?: string; canonicalLink?: string }) =>
        (p.link || "").includes("thekashmirweaver.shop") &&
        !(p.canonicalLink || "").includes("thekashmirweaver.com"),
    ).length;
    checks.push({
      name: "Merchant Center links (.com)",
      ok: shopCanonical === 0 && comCanonical >= 180,
      detail: `${comCanonical}/${items.length} canonical .com, ${shopCanonical} canonical .shop, ${shopLinkOnly} variant link .shop only (Shopify resync)`,
    });
  } catch (e) {
    checks.push({
      name: "Merchant Center links (.com)",
      ok: false,
      detail: String(e),
    });
  }

  try {
    const token = await googleWebmastersToken(CREDS);
    const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    const sites = (json.siteEntry || []) as Array<{ siteUrl: string; permissionLevel: string }>;
    const shop = sites.find((s) => s.siteUrl.includes("thekashmirweaver.shop"));
    const com = sites.find((s) => s.siteUrl.includes("thekashmirweaver.com"));
    checks.push({
      name: "GSC .shop sitemap",
      ok: shop?.permissionLevel === "siteOwner",
      detail: shop ? `${shop.siteUrl} (${shop.permissionLevel})` : "not listed",
    });
    checks.push({
      name: "GSC .com property",
      ok: com?.permissionLevel === "siteOwner",
      detail: com ? `${com.siteUrl} (${com.permissionLevel})` : "add & verify sc-domain:thekashmirweaver.com",
    });
  } catch (e) {
    checks.push({ name: "GSC", ok: false, detail: String(e) });
  }

  checks.push({
    name: "Shopify checkout pixels (custom)",
    ok: existsSync(resolve(ROOT, ".shopify-admin-state.json")),
    detail: existsSync(resolve(ROOT, ".shopify-admin-state.json"))
      ? "Admin session saved — run shopify:install-checkout-pixels if not done"
      : "Run: npm run shopify:install-checkout-pixels (one-time Admin login)",
  });

  checks.push({
    name: "Partner web pixel extension",
    ok: false,
    detail:
      "Install Partner app then npm run pixel:activate in hydrogen repo. URL: https://70yuey-sr.myshopify.com/admin/oauth/install?client_id=60df4f5aba046f1301c715771ac0c30b",
  });

  console.log("\nIntegration verification\n");
  let pass = 0;
  for (const c of checks) {
    const mark = c.ok ? "✓" : "✗";
    console.log(`${mark} ${c.name}`);
    console.log(`  ${c.detail}\n`);
    if (c.ok) pass++;
  }
  console.log(`${pass}/${checks.length} checks passed`);
  if (pass < checks.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
