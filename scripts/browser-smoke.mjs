import { chromium } from "playwright";

const baseURL = process.env.PREVIEW_URL || "https://progamefinds.online";
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
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("requestfailed", request => failedRequests.push(request.url() + " :: " + request.failure()?.errorText));

  const response = await page.goto(baseURL, { waitUntil: "networkidle", timeout: 45000 });
  check(Boolean(response && response.ok()), "Fitness portal homepage returns HTTP success");
  check((await page.title()).includes("ProGameFinds") && (await page.title()).includes("Fitness"), "Homepage title identifies the fitness research portal");
  check(await page.locator('meta[name="description"]').count() === 1, "Homepage has exactly one meta description");
  check(await page.locator("h1").count() === 1, "Homepage has one primary H1");
  check((await page.locator("h1").innerText()).toLowerCase().includes("equipment"), "Homepage H1 describes equipment research");

  const categories = page.locator("[data-equipment-card]");
  check(await categories.count() === 6, "All six fitness equipment categories render");
  const categoryPaths = [
    "/strength-equipment.html", "/cardio-equipment.html", "/home-gym.html",
    "/fitness-accessories.html", "/gym-flooring-storage.html", "/mobility-recovery.html"
  ];
  for (const path of categoryPaths) {
    check(await page.locator('a[href="' + path + '"]').count() >= 1, "Category route is linked: " + path);
  }

  const search = page.locator("#equipment-search");
  await search.fill("strength");
  check(await page.locator("[data-equipment-card]:visible").count() === 1, "Equipment search filters to the strength category");
  await search.fill("no-such-equipment-term-xyz");
  check(await page.locator("[data-equipment-card]:visible").count() === 0, "No-result search hides non-matching categories");
  check((await page.locator("#catalogue-status").textContent()).includes("No categories match"), "No-result search announces accessible status");
  await search.fill("");
  await page.locator('[data-filter="cardio"]').click();
  check(await page.locator('[data-equipment-card]:visible').count() === 1, "Cardio filter selects one category");
  check(await page.locator('[data-filter="cardio"]').getAttribute("aria-pressed") === "true", "Active filter exposes aria-pressed");
  await page.locator('[data-filter="all"]').click();
  check(await page.locator("[data-equipment-card]:visible").count() === 6, "All filter restores all six categories");

  const shoppingLinks = page.locator('a[href*="amazon.com"], a[href*="logitech"], a[href*="razer.com"], a[href*="hyperx.com"], a[href*="steelseries.com"], a[href*="gamesir.com"]');
  check(await shoppingLinks.count() === 0, "No active Amazon, distributor or manufacturer shopping links are present");
  check(await page.locator('a[href^="http"]').count() === 0, "No outbound HTTP shopping links are present");
  const bodyText = await page.locator("body").innerText();
  check(!bodyText.includes("As an Amazon Associate I earn from qualifying purchases"), "Site does not claim unconfirmed Amazon Associate status");
  check(bodyText.includes("Amazon-only affiliate integration is currently disabled"), "Affiliate-disabled status is clearly disclosed");

  const activePages = [
    "/strength-equipment.html", "/cardio-equipment.html", "/home-gym.html",
    "/fitness-accessories.html", "/gym-flooring-storage.html", "/mobility-recovery.html",
    "/guides.html", "/guides/planning-a-home-gym.html", "/guides/strength-equipment-selection.html",
    "/guides/cardio-equipment-buying-guide.html", "/guides/choosing-gym-flooring.html",
    "/guides/fitness-equipment-safety-checklist.html", "/guides/checking-an-amazon-product-listing.html",
    "/guides/cleaning-and-maintaining-equipment.html", "/collections.html", "/about.html",
    "/how-we-review.html", "/affiliate-disclosure.html", "/privacy.html", "/terms.html", "/support.html"
  ];
  for (const path of activePages) {
    const pageResponse = await page.request.get(new URL(path, baseURL).toString());
    check(pageResponse.ok(), path + " returns HTTP success");
  }

  const evidenceResponse = await page.request.get(new URL("/data/fitness-equipment-evidence.json", baseURL).toString());
  check(evidenceResponse.ok(), "Fitness equipment evidence register is accessible");
  const evidence = await evidenceResponse.json();
  check(evidence.status === "editorial_categories_only" && evidence.product_records.length === 0, "No unverified fitness products are published");

  const retiredResponse = await page.request.get(new URL("/data/product-verification.json", baseURL).toString());
  check(retiredResponse.ok(), "Legacy evidence endpoint returns a controlled retirement record");
  const retired = await retiredResponse.json();
  check(retired.status === "legacy_gaming_catalogue_retired" && retired.active_product_records.length === 0, "Legacy gaming product records are retired");

  for (const [legacyPath, expectedPath] of [
    ["/gaming-mice.html", "/strength-equipment.html"],
    ["/gaming-headsets.html", "/fitness-accessories.html"],
    ["/gaming-chairs-desks.html", "/home-gym.html"],
    ["/guides/choosing-a-gaming-mouse.html", "/guides/strength-equipment-selection.html"]
  ]) {
    const legacyResponse = await page.request.get(new URL(legacyPath, baseURL).toString());
    check(legacyResponse.ok() && new URL(legacyResponse.url()).pathname.replace(/\.html$/, "") === expectedPath.replace(/\.html$/, ""), "Legacy route redirects correctly: " + legacyPath + " -> " + legacyResponse.url());
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
      const el = document.querySelector("details.mobile-nav");
      return Boolean(el && getComputedStyle(el).display !== "none");
    })()
  }));
  check(metrics.mobile.documentWidth <= metrics.mobile.viewportWidth, "390px mobile viewport has no horizontal overflow");
  check(metrics.mobile.menuVisible, "Mobile navigation menu is present");

  const unexpectedConsoleErrors = consoleErrors.filter(message =>
    !(message.includes("static.cloudflareinsights.com/beacon.min.js") &&
      message.includes("Content Security Policy"))
  );
  check(unexpectedConsoleErrors.length === 0, "Browser console has no unexpected errors" + (unexpectedConsoleErrors.length ? ": " + unexpectedConsoleErrors.join(" | ") : ""));
  check(pageErrors.length === 0, "Browser runtime has no uncaught errors" + (pageErrors.length ? ": " + pageErrors.join(" | ") : ""));
  const sameOriginFailures = failedRequests.filter(url => url.startsWith(baseURL));
  check(sameOriginFailures.length === 0, "No failed same-origin asset requests" + (sameOriginFailures.length ? ": " + sameOriginFailures.join(" | ") : ""));
} finally {
  await browser.close();
}

console.log("FITNESS PORTAL BROWSER METRICS " + JSON.stringify(metrics, null, 2));
if (failures.length) {
  console.error("FITNESS PORTAL BROWSER QA FAILED: " + failures.length + " check(s)");
  process.exit(1);
}
console.log("FITNESS PORTAL BROWSER QA PASSED");
