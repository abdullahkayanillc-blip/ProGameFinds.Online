import { chromium } from "playwright";

const baseURL = process.env.PREVIEW_URL || "https://421a421b.progamefinds-online.pages.dev";
const failures = [];
const metrics = {};
const check = (condition, message) => {
  if (!condition) failures.push(message);
  console.log((condition ? "PASS " : "FAIL ") + message);
};

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(request.url() + " :: " + request.failure()?.errorText));

  const response = await page.goto(baseURL, { waitUntil: "networkidle", timeout: 45000 });
  check(Boolean(response && response.ok()), "Preview homepage returns a successful HTTP response");
  check((await page.title()).includes("ProGameFinds"), "Homepage title identifies ProGameFinds");
  check(await page.locator('meta[name="description"]').count() === 1, "Homepage has exactly one meta description");

  const amazonLinks = page.locator('a[href*="amazon.com/"]');
  const amazonCount = await amazonLinks.count();
  check(amazonCount === 22, "All 22 existing Amazon outbound links are present");
  let affiliateLinksValid = true;
  for (let i = 0; i < amazonCount; i++) {
    const link = amazonLinks.nth(i);
    const href = await link.getAttribute("href") || "";
    const rel = await link.getAttribute("rel") || "";
    const text = await link.innerText();
    if (!href.includes("tag=progamefinds-20") || !rel.includes("sponsored") || !rel.includes("noopener") || !text.includes("paid link")) affiliateLinksValid = false;
  }
  check(affiliateLinksValid, "Every Amazon CTA retains affiliate tag, sponsored/noopener rel and paid-link disclosure");

  const aboutLinks = page.locator('nav[aria-label="Primary"] a[href="/about.html"]');
  check(await aboutLinks.count() === 1, "Primary navigation contains one About link (no duplicate)");

  const search = page.locator("#gear-search");
  await search.fill("Logitech G305");
  check(await page.locator(".card:visible").count() === 1, "Search filters the catalogue to the matching G305 card");
  await search.fill("no-such-gaming-device-xyz");
  check(await page.locator(".card:visible").count() === 0, "No-result search hides non-matching cards");
  check((await page.locator("#gear-status").innerText()).includes("No listings match"), "No-result search announces an accessible status message");
  await search.fill("");

  await page.locator('[data-filter="mice"]').click();
  check(await page.locator('#mice .card:visible').count() === 4, "Mice category filter displays four mouse candidates");
  check(await page.locator('[data-filter="mice"]').getAttribute("aria-pressed") === "true", "Active category filter exposes aria-pressed state");
  await page.locator('[data-filter="all"]').click();
  check(await page.locator(".card:visible").count() === 22, "All gear filter restores all 22 catalogue cards, including category searches");

  for (const path of ["/about.html", "/affiliate-disclosure.html", "/privacy.html", "/terms.html"]) {
    const pageResponse = await page.request.get(new URL(path, baseURL).toString());
    check(pageResponse.ok(), path + " returns a successful HTTP response");
  }

  metrics.desktop = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    return {
      domContentLoadedMs: Math.round(nav?.domContentLoadedEventEnd || 0),
      loadEventMs: Math.round(nav?.loadEventEnd || 0),
      transferSizeBytes: resources.reduce((sum, item) => sum + (item.transferSize || 0), 0),
      resourceCount: resources.length,
      documentHeight: document.documentElement.scrollHeight,
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth
    };
  });
  check(metrics.desktop.documentWidth <= metrics.desktop.viewportWidth, "Desktop viewport has no horizontal overflow");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle", timeout: 45000 });
  metrics.mobile = await page.evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
    menuVisible: (() => {
      const el = document.querySelector("details.menu");
      return Boolean(el && getComputedStyle(el).display !== "none");
    })()
  }));
  check(metrics.mobile.documentWidth <= metrics.mobile.viewportWidth, "390px mobile viewport has no horizontal overflow");
  check(metrics.mobile.menuVisible, "Mobile navigation menu is present");

  check(consoleErrors.length === 0, "Browser console has no errors" + (consoleErrors.length ? ": " + consoleErrors.join(" | ") : ""));
  check(pageErrors.length === 0, "Browser runtime has no uncaught page errors" + (pageErrors.length ? ": " + pageErrors.join(" | ") : ""));
  const sameOriginFailures = failedRequests.filter((url) => url.startsWith(baseURL));
  check(sameOriginFailures.length === 0, "No failed same-origin asset requests" + (sameOriginFailures.length ? ": " + sameOriginFailures.join(" | ") : ""));
} finally {
  await browser.close();
}

console.log("PERFORMANCE SMOKE METRICS " + JSON.stringify(metrics, null, 2));
if (failures.length) {
  console.error("PREVIEW BROWSER QA FAILED: " + failures.length + " check(s)");
  process.exit(1);
}
console.log("PREVIEW BROWSER QA PASSED");
