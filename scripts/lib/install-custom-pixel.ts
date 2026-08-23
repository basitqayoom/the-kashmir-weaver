/**
 * Shared Playwright helper for Shopify Admin custom-pixel install.
 * Handles Polaris iframes and updates existing GA4 / Meta pixels by name.
 */
import { chromium, type BrowserContext, type Frame, type Page } from "playwright";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

let sharedContext: BrowserContext | null = null;

export type InstallCustomPixelOptions = {
  url: string;
  name: string;
  /** Alternate names already present in Admin to open for update */
  aliases?: string[];
  codePath: string;
  statePath: string;
  profileDir?: string;
  reuseBrowser?: boolean;
};

function loadCode(codePath: string) {
  return readFileSync(codePath, "utf8")
    .replace(/^\/\*[\s\S]*?\*\//, "")
    .trim();
}

function isClosedError(err: unknown) {
  return /Target page, context or browser has been closed|browser has been closed|has been closed/i.test(
    String(err),
  );
}

/** Page + all child frames (Shopify Admin embeds settings in iframes). */
function scopes(page: Page): Array<Page | Frame> {
  return [page, ...page.frames()];
}

async function ensureContext(options: {
  statePath: string;
  profileDir: string;
  reuseBrowser: boolean;
}): Promise<BrowserContext> {
  if (options.reuseBrowser && sharedContext) {
    try {
      await sharedContext.pages();
      return sharedContext;
    } catch {
      sharedContext = null;
    }
  }

  mkdirSync(options.profileDir, { recursive: true });

  const launchOpts = {
    headless: false,
    channel: "chrome" as const,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-first-run",
      "--no-default-browser-check",
    ],
    viewport: { width: 1440, height: 960 },
    ignoreDefaultArgs: ["--enable-automation"],
  };

  let context: BrowserContext;
  try {
    context = await chromium.launchPersistentContext(options.profileDir, launchOpts);
  } catch {
    context = await chromium.launchPersistentContext(options.profileDir, {
      ...launchOpts,
      channel: undefined,
    });
  }

  if (existsSync(options.statePath)) {
    try {
      await context.addCookies(
        JSON.parse(readFileSync(options.statePath, "utf8")).cookies || [],
      );
    } catch {
      // ignore
    }
  }

  if (options.reuseBrowser) sharedContext = context;
  return context;
}

async function waitForAdmin(page: Page, store: string, targetUrl: string) {
  const deadline = Date.now() + 10 * 60 * 1000;
  let prompted = false;

  while (Date.now() < deadline) {
    if (page.isClosed()) {
      throw new Error(
        "Browser window was closed during login. Re-run and keep Chrome open until the script finishes.",
      );
    }

    const url = page.url();
    const onStore = /\/store\//i.test(url);
    const onLogin = /accounts\.shopify\.com|\/login/i.test(url);

    if (onStore && !onLogin) {
      if (!/customer_events/i.test(url)) {
        await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 180000 });
        await page.waitForTimeout(2500);
      }
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(2500);
      return;
    }

    if (onLogin && !prompted) {
      console.log("\n>>> Login required — complete it in the Chrome window.");
      console.log(">>> Do NOT close the browser. Waiting up to 10 minutes…\n");
      prompted = true;
    }

    await page.waitForTimeout(2000);
  }

  throw new Error("Timed out waiting for Shopify Admin login (10 min).");
}

async function dumpDebug(page: Page, dir: string, label: string) {
  mkdirSync(dir, { recursive: true });
  const shot = resolve(dir, `${label}.png`);
  try {
    await page.screenshot({ path: shot, fullPage: true });
  } catch {
    // ignore
  }
  try {
    writeFileSync(resolve(dir, `${label}.html`), await page.content());
  } catch {
    // ignore
  }
  console.log(`Debug dump: ${shot}`);
}

async function clickTextInAnyScope(
  page: Page,
  patterns: RegExp[],
  opts?: { role?: "button" | "link"; force?: boolean },
): Promise<boolean> {
  for (const scope of scopes(page)) {
    for (const re of patterns) {
      const locs = opts?.role
        ? [scope.getByRole(opts.role, { name: re })]
        : [
            scope.getByRole("button", { name: re }),
            scope.getByRole("link", { name: re }),
            scope.getByText(re, { exact: false }),
          ];
      for (const loc of locs) {
        const el = loc.first();
        if (await el.isVisible({ timeout: 600 }).catch(() => false)) {
          await el.click({ timeout: 8000, force: opts?.force ?? false });
          return true;
        }
      }
    }
  }
  return false;
}

async function modalOpen(page: Page) {
  for (const scope of scopes(page)) {
    const modal = scope.locator('s-internal-modal[open], [role="dialog"], [aria-modal="true"]').first();
    if (await modal.isVisible().catch(() => false)) return true;
  }
  return false;
}

async function editorVisible(page: Page) {
  for (const scope of scopes(page)) {
    if (await scope.locator(".monaco-editor").first().isVisible().catch(() => false)) {
      return true;
    }
    if (
      await scope.locator(".cm-editor, .cm-content").first().isVisible().catch(() => false)
    ) {
      return true;
    }
    if (await scope.locator("textarea").last().isVisible().catch(() => false)) {
      return true;
    }
  }
  return false;
}

async function pasteCode(page: Page, code: string) {
  for (const scope of scopes(page)) {
    const monaco = scope.locator(".monaco-editor textarea").first();
    if (await monaco.isVisible().catch(() => false)) {
      await monaco.click({ force: true });
      await page.keyboard.press("Meta+A");
      await page.keyboard.insertText(code);
      return;
    }
    const cm = scope.locator(".cm-content, .cm-editor").first();
    if (await cm.isVisible().catch(() => false)) {
      await cm.click({ force: true });
      await page.keyboard.press("Meta+A");
      await page.keyboard.insertText(code);
      return;
    }
    const editable = scope.locator('[contenteditable="true"]').last();
    if (await editable.isVisible().catch(() => false)) {
      await editable.click({ force: true });
      await page.keyboard.press("Meta+A");
      await page.keyboard.insertText(code);
      return;
    }
    const ta = scope.locator("textarea").last();
    if (await ta.isVisible().catch(() => false)) {
      await ta.fill(code);
      return;
    }
  }
  throw new Error("Could not find pixel code editor");
}

async function fillName(page: Page, name: string) {
  for (const scope of scopes(page)) {
    const nameField = scope
      .locator(
        'input[name="name"], input[aria-label*="name" i], input[placeholder*="Pixel name" i], input[placeholder*="name" i]',
      )
      .first();
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill(name);
      console.log("Set name:", name);
      return;
    }
  }
}

async function saveAndConnect(page: Page) {
  // Prefer the top-bar Save next to "Unsaved changes"
  const unsaved = page.getByText(/unsaved changes/i).first();
  if (await unsaved.isVisible().catch(() => false)) {
    const barSave = page.locator("header, [role='banner'], body").getByRole("button", {
      name: /^save$/i,
    });
    const n = await barSave.count();
    for (let i = 0; i < n; i++) {
      const btn = barSave.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        await btn.click({ force: true });
        console.log("Clicked top-bar Save");
        await page.waitForTimeout(3000);
        break;
      }
    }
  }

  const saved = await clickTextInAnyScope(page, [/^save$/i, /save pixel/i, /save changes/i], {
    force: true,
  });
  if (saved) {
    console.log("Clicked Save");
    await page.waitForTimeout(3000);
  } else {
    await page.keyboard.press("Meta+S");
    await page.waitForTimeout(2000);
    console.warn("Save button not found — tried Meta+S.");
  }

  // Wait until unsaved banner clears (up to 15s)
  for (let i = 0; i < 15; i++) {
    if (!(await page.getByText(/unsaved changes/i).first().isVisible().catch(() => false))) {
      console.log("Save confirmed (no unsaved banner).");
      break;
    }
    await page.keyboard.press("Meta+S");
    await page.waitForTimeout(1000);
  }

  if (await clickTextInAnyScope(page, [/^connect$/i, /connect pixel/i], { force: true })) {
    console.log("Connecting pixel…");
    await page.waitForTimeout(1200);
    await clickTextInAnyScope(page, [/^connect$/i], { force: true });
    await page.waitForTimeout(1500);
  }
}

async function completeAddPixelModal(page: Page, name: string) {
  console.log("Add custom pixel modal open — filling name…");
  await fillName(page, name);
  // Confirm create in modal
  const created =
    (await clickTextInAnyScope(page, [/^add$/i, /^create$/i, /add pixel/i, /continue/i], {
      role: "button",
      force: true,
    })) ||
    (await clickTextInAnyScope(page, [/^add$/i, /^create$/i, /continue/i], { force: true }));
  if (!created) {
    // Press Enter in name field
    await page.keyboard.press("Enter");
  }
  await page.waitForTimeout(2500);
}

async function openOrCreatePixel(
  page: Page,
  name: string,
  aliases: string[],
  debugDir: string,
) {
  const namesToTry = [name, ...aliases];

  for (const label of namesToTry) {
    // Prefer table/row link over loose text matches
    let opened = false;
    for (const scope of scopes(page)) {
      const row = scope
        .locator("table tr, [role='row'], a, button")
        .filter({ hasText: new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i") })
        .first();
      if (await row.isVisible({ timeout: 800 }).catch(() => false)) {
        await row.click({ force: true });
        opened = true;
        break;
      }
    }
    if (!opened) {
      opened = await clickTextInAnyScope(page, [
        new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"),
      ]);
    }
    if (opened) {
      console.log(`Opened existing pixel: ${label}`);
      await page.waitForTimeout(3000);
      if (await editorVisible(page)) return;
      await clickTextInAnyScope(page, [/^edit$/i, /edit code/i, /^code$/i], { force: true });
      await page.waitForTimeout(1500);
      if (await editorVisible(page)) return;
      // Still no editor — fall through to add flow / assisted
      console.log("Pixel row opened but editor not visible yet.");
    }
  }

  console.log("Looking for Add custom pixel…");
  const added =
    (await clickTextInAnyScope(page, [/add custom pixel/i], { role: "button", force: true })) ||
    (await clickTextInAnyScope(page, [/add custom pixel/i], { force: true }));

  if (added || (await modalOpen(page))) {
    await page.waitForTimeout(1000);
    if (await modalOpen(page)) {
      await completeAddPixelModal(page, name);
    } else {
      // Dropdown: choose Custom pixel once
      await clickTextInAnyScope(page, [/^custom pixel$/i], { force: true });
      await page.waitForTimeout(2000);
      if (await modalOpen(page)) {
        await completeAddPixelModal(page, name);
      }
    }
    if (await editorVisible(page)) return;
  }

  await dumpDebug(page, debugDir, `fail-${Date.now()}`);

  console.log("\n>>> Automated UI click failed.");
  console.log(">>> In Chrome: open GA4 Pixel or Meta Pixel Purchase (or Add custom pixel)");
  console.log(">>> until the code editor is visible. Script will continue…\n");

  const assistDeadline = Date.now() + 8 * 60 * 1000;
  while (Date.now() < assistDeadline) {
    if (page.isClosed()) throw new Error("Browser closed during assisted install.");
    if (await modalOpen(page)) {
      await completeAddPixelModal(page, name);
    }
    if (await editorVisible(page)) {
      console.log("Editor detected — continuing.");
      return;
    }
    await page.waitForTimeout(2000);
  }

  throw new Error("Timed out waiting for pixel editor (assisted mode).");
}

export async function installCustomPixel(options: InstallCustomPixelOptions) {
  const {
    url,
    name,
    aliases = [],
    codePath,
    statePath,
    reuseBrowser = false,
    profileDir = resolve(statePath, "..", "tmp", "shopify-admin-profile"),
  } = options;
  const code = loadCode(codePath);
  const debugDir = resolve(statePath, "..", "tmp");

  const context = await ensureContext({ statePath, profileDir, reuseBrowser });
  let page = context.pages().find((p) => !p.isClosed()) || (await context.newPage());
  page.setDefaultTimeout(60000);

  try {
    console.log("Opening", url);
    try {
      await page.goto(url, { waitUntil: "load", timeout: 180000 });
    } catch (err) {
      if (isClosedError(err)) {
        throw new Error(
          "Chrome closed immediately after launch. Re-run and leave the window open.",
        );
      }
      page = await context.newPage();
      page.setDefaultTimeout(60000);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 180000 });
    }

    await page.waitForTimeout(2000);
    await waitForAdmin(page, "thekashmirweaver", url);
    console.log("URL now:", page.url());

    try {
      await context.storageState({ path: statePath });
    } catch {
      // non-fatal
    }

    await openOrCreatePixel(page, name, aliases, debugDir);
    await fillName(page, name);
    console.log("Pasting pixel code…");
    await pasteCode(page, code);
    await saveAndConnect(page);

    try {
      await context.storageState({ path: statePath });
    } catch {
      // non-fatal
    }
    await page.screenshot({
      path: resolve(debugDir, `done-${name.replace(/\W+/g, "-").slice(0, 40)}.png`),
      fullPage: true,
    });
    console.log(`Saved: ${name}`);

    // Return to list for next pixel
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(1500);
  } finally {
    if (!reuseBrowser) {
      try {
        if (!page.isClosed()) await page.close();
      } catch {
        // ignore
      }
      try {
        await context.close();
      } catch {
        // ignore
      }
      if (sharedContext === context) sharedContext = null;
    }
  }
}

export async function closeSharedBrowser() {
  if (sharedContext) {
    try {
      await sharedContext.close();
    } catch {
      // ignore
    }
  }
  sharedContext = null;
}
