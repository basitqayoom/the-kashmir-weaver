/**
 * Open GA4 Pixel, re-paste checkout code, and force Save until banner clears.
 */
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PROFILE = resolve(ROOT, "tmp/shopify-admin-profile");
const ADMIN_URL =
  "https://admin.shopify.com/store/thekashmirweaver/settings/customer_events";
const CODE = readFileSync(resolve(ROOT, "scripts/ga4-shopify-custom-pixel.js"), "utf8")
  .replace(/^\/\*[\s\S]*?\*\//, "")
  .trim();

async function main() {
  mkdirSync(PROFILE, { recursive: true });
  const context = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    channel: "chrome",
    viewport: { width: 1440, height: 960 },
  });
  const page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(60000);

  await page.goto(ADMIN_URL, { waitUntil: "load", timeout: 180000 });
  await page.waitForTimeout(3000);

  // Click the table row text with exact match, preferring shorter elements
  const matches = page.getByText("GA4 Pixel", { exact: true });
  const count = await matches.count();
  console.log("GA4 Pixel matches:", count);
  let opened = false;
  for (let i = 0; i < count; i++) {
    const el = matches.nth(i);
    const box = await el.boundingBox().catch(() => null);
    console.log(` match ${i}: box=`, box);
    if (box && box.height > 0 && box.height <= 40) {
      await el.click({ force: true });
      opened = true;
      break;
    }
  }
  if (!opened && count > 0) {
    await matches.first().click({ force: true });
    opened = true;
  }
  console.log("Opened:", opened);
  await page.waitForTimeout(3500);

  // Paste code into monaco if present
  const monaco = page.locator(".monaco-editor textarea").first();
  if (await monaco.isVisible().catch(() => false)) {
    console.log("Pasting GA4 code…");
    await monaco.click({ force: true });
    await page.keyboard.press("Meta+A");
    await page.keyboard.insertText(CODE);
    await page.waitForTimeout(1000);
  } else {
    console.log("Monaco not visible — URL:", page.url());
  }

  for (let i = 0; i < 15; i++) {
    const unsaved = await page.getByText(/unsaved changes/i).first().isVisible().catch(() => false);
    console.log(`Save loop ${i + 1}: unsaved=${unsaved}`);
    if (!unsaved && i > 0) break;

    // Click every visible Save button
    const saves = page.getByRole("button", { name: /^save$/i });
    const n = await saves.count();
    for (let j = 0; j < n; j++) {
      const btn = saves.nth(j);
      if (await btn.isVisible().catch(() => false)) {
        await btn.click({ force: true });
        console.log("Clicked Save #", j);
      }
    }
    await page.keyboard.press("Meta+S");
    await page.waitForTimeout(2000);
  }

  const still = await page.getByText(/unsaved changes/i).first().isVisible().catch(() => false);
  await page.screenshot({ path: resolve(ROOT, "tmp/ga4-repaste-save.png"), fullPage: true });
  console.log("Done. Still unsaved:", still, "URL:", page.url());

  await context.storageState({ path: resolve(ROOT, ".shopify-admin-state.json") });
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
