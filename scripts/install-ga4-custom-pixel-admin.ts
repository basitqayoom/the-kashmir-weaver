/**
 * Install GA4 Purchase custom pixel via Shopify Admin UI.
 * Run: npx --prefix ../hydrogen-the-kashmir-weaver tsx scripts/install-ga4-custom-pixel-admin.ts
 */
import { installCustomPixel, closeSharedBrowser } from "./lib/install-custom-pixel";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const STATE = resolve(ROOT, ".shopify-admin-state.json");
const STORE = "70yuey-sr";
const URL = `https://admin.shopify.com/store/${STORE}/settings/customer_events`;
const NAME = "GA4 — Purchase (The Kashmir Weaver)";

async function main() {
  mkdirSync(resolve(ROOT, "tmp"), { recursive: true });
  await installCustomPixel({
    url: URL,
    name: NAME,
    codePath: resolve(ROOT, "scripts/ga4-shopify-custom-pixel.js"),
    statePath: STATE,
  });
  await closeSharedBrowser();
  console.log("GA4 custom pixel installed/updated.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
