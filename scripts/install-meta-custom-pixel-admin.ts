/**
 * Install Meta Purchase custom pixel via Shopify Admin UI.
 */
import { installCustomPixel, closeSharedBrowser } from "./lib/install-custom-pixel";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const STATE = resolve(ROOT, ".shopify-admin-state.json");
const STORE = "70yuey-sr";
const URL = `https://admin.shopify.com/store/${STORE}/settings/customer_events`;
const NAME = "Meta Pixel — Purchase (The Kashmir Weaver)";

async function main() {
  mkdirSync(resolve(ROOT, "tmp"), { recursive: true });
  await installCustomPixel({
    url: URL,
    name: NAME,
    codePath: resolve(ROOT, "scripts/meta-pixel-shopify-custom-pixel.js"),
    statePath: STATE,
  });
  await closeSharedBrowser();
  console.log("Meta custom pixel installed/updated.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
