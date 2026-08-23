/**
 * Submit sitemap to Google Search Console.
 *
 * Usage: npx tsx scripts/submit-gsc-sitemap.ts [siteUrl] [sitemapUrl]
 * Defaults: sc-domain:thekashmirweaver.com → https://thekashmirweaver.com/sitemap.xml
 */
import { resolve } from "node:path";
import { googleWebmastersToken } from "../../hydrogen-the-kashmir-weaver/scripts/lib/google-auth.ts";

const siteUrl = process.argv[2] || "sc-domain:thekashmirweaver.com";
const sitemapUrl =
  process.argv[3] || "https://thekashmirweaver.com/sitemap.xml";

const CREDS = resolve(
  import.meta.dirname,
  "../../hydrogen-the-kashmir-weaver/secrets/google/merchant-service-account.json",
);

async function auth() {
  return googleWebmastersToken(CREDS);
}

async function listSites() {
  const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${await auth()}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return (json.siteEntry || []) as Array<{
    siteUrl: string;
    permissionLevel: string;
  }>;
}

async function addSite(url: string) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(url)}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${await auth()}` },
    },
  );
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`addSite ${res.status}: ${text}`);
  }
}

async function submitSitemap(site: string, feed: string) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(feed)}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${await auth()}` },
    },
  );
  const text = await res.text();
  if (!res.ok && res.status !== 204) {
    throw new Error(`submitSitemap ${res.status}: ${text}`);
  }
}

async function main() {
  const sites = await listSites();
  console.log(
    "Verified sites:",
    sites.map((s) => s.siteUrl).join(", ") || "(none)",
  );

  if (!sites.some((s) => s.siteUrl === siteUrl)) {
    console.log(`Adding property ${siteUrl}…`);
    try {
      await addSite(siteUrl);
      console.log("Property added (verify DNS/HTML if not already verified).");
    } catch (e) {
      console.warn(String(e));
    }
  }

  console.log(`Submitting ${sitemapUrl} to ${siteUrl}…`);
  await submitSitemap(siteUrl, sitemapUrl);
  console.log("Sitemap submitted.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
