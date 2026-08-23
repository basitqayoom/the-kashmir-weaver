/**
 * Finish Save/Connect for GA4 + Meta custom pixels.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const STATE = resolve(ROOT, ".shopify-admin-state.json");
const PROFILE = resolve(ROOT, "tmp", "shopify-admin-profile");
const URL = "https://admin.shopify.com/store/thekashmirweaver/settings/customer_events";

const PIXELS = ["GA4 Pixel", "Meta Pixel Purchase"];

async function clickVisibleSave(page: import("playwright").Page) {
  const buttons = page.getByRole("button", { name: /^save$/i });
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true });
      console.log("Clicked Save");
      await page.waitForTimeout(2500);
      return true;
    }
  }
  await page.keyboard.press("Meta+S");
  console.log("Tried Meta+S");
  await page.waitForTimeout(1500);
  return false;
}

async function main() {
  mkdirSync(PROFILE, { recursive: true });
  const context = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    channel: "chrome",
    viewport: { width: 1440, height: 960 },
  });
  const page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(45000);

  for (const name of PIXELS) {
    console.log(`\n— Finalize ${name} —`);
    await page.goto(URL, { waitUntil: "load", timeout: 180000 });
    await page.waitForTimeout(2500);

    // Prefer table cell / link with exact-ish name
    const link = page.locator("a, button, [role='link'], [role='row']").filter({
      hasText: new RegExp(`^\\s*${name}\\s*$`, "i"),
    }).first();

    if (await link.isVisible({ timeout: 3000 }).catch(() => false)) {
      await link.click({ force: true });
    } else {
      // Fallback: last matching visible text that is not a long heading
      const candidates = page.getByText(name, { exact: true });
      const n = await candidates.count();
      let clicked = false;
      for (let i = 0; i < n; i++) {
        const el = candidates.nth(i);
        const box = await el.boundingBox().catch(() => null);
        if (box && box.height < 40 && box.width > 20) {
          await el.click({ force: true });
          clicked = true;
          break;
        }
      }
      if (!clicked) {
        console.warn(`Could not open ${name} from list — saving current page if editor open`);
      }
    }

    await page.waitForTimeout(2500);
    await clickVisibleSave(page);

    const connect = page.getByRole("button", { name: /^connect$/i }).first();
    if (await connect.isVisible().catch(() => false)) {
      await connect.click({ force: true });
      console.log("Clicked Connect");
      await page.waitForTimeout(1500);
    }

    await page.screenshot({
      path: resolve(ROOT, "tmp", `finalize-${name.replace(/\W+/g, "-")}.png`),
      fullPage: true,
    });
  }

  await context.storageState({ path: STATE });
  await context.close();
  console.log("\nFinalize done.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
