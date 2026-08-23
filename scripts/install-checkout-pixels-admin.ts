/**
 * Install GA4 + Meta checkout custom pixels in one Admin session.
 * Requires one-time Shopify Admin login in the opened browser.
 *
 * Run: npm run shopify:install-checkout-pixels
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { installCustomPixel, closeSharedBrowser } from "./lib/install-custom-pixel";

const ROOT = resolve(import.meta.dirname, "..");
const STATE = resolve(ROOT, ".shopify-admin-state.json");

// Prefer vanity store handle (Admin redirects 70yuey-sr → thekashmirweaver)
const STORE = "thekashmirweaver";
const URL = `https://admin.shopify.com/store/${STORE}/settings/customer_events`;

const PIXELS = [
  {
    name: "GA4 — Purchase (The Kashmir Weaver)",
    aliases: ["GA4 Pixel", "GA4 — Purchase (Hydrogen)", "GA4 — Purchase"],
    file: "ga4-shopify-custom-pixel.js",
  },
  {
    name: "Meta Pixel — Purchase (The Kashmir Weaver)",
    aliases: ["Meta Pixel Purchase", "Meta Pixel — Purchase (Hydrogen)", "Meta Pixel — Purchase"],
    file: "meta-pixel-shopify-custom-pixel.js",
  },
] as const;

async function main() {
  const profileDir = resolve(ROOT, "tmp", "shopify-admin-profile");
  mkdirSync(profileDir, { recursive: true });

  console.log("Launching Chrome for Shopify Admin…");
  console.log("If login appears: complete it and KEEP the window open.\n");

  try {
    for (const pixel of PIXELS) {
      console.log(`\n— ${pixel.name} —`);
      await installCustomPixel({
        url: URL,
        name: pixel.name,
        aliases: [...pixel.aliases],
        codePath: resolve(ROOT, "scripts", pixel.file),
        statePath: STATE,
        profileDir,
        reuseBrowser: true,
      });
    }

    console.log("\nAll checkout pixels installed/updated.");
    console.log(`Session saved: ${STATE}`);
  } finally {
    await closeSharedBrowser();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
