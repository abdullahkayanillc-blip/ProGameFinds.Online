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
  if (baseURL === "https://progamefinds.online") {
    const wwwResponse = await page.request.get("https://www.progamefinds.online", { maxRedirects: 0 });
    const wwwLocation = wwwResponse.headers()["location"] || "";
    const wwwTarget = wwwLocation ? new URL(wwwLocation, "https://www.progamefinds.online") : null;
    check([301, 308].includes(wwwResponse.status()) && wwwTarget?.origin === "https://progamefinds.online" && wwwTarget.pathname === "/", "www hostname redirects permanently to canonical root domain");

    const deepPath = "/guides/choosing-a-gaming-mouse.html";
    const deepQuery = "?source=qa&campaign=canonical-redirect";
    const deepResponse = await page.request.get("https://www.progamefinds.online" + deepPath + deepQuery, { maxRedirects: 0 });
    const deepLocation = deepResponse.headers()["location"] || "";
    const deepTarget = deepLocation ? new URL(deepLocation, "https://www.progamefinds.online") : null;
    check([301, 308].includes(deepResponse.status()) && deepTarget?.origin === "https://progamefinds.online" && deepTarget.pathname === deepPath && deepTarget.search === deepQuery, "www redirect preserves a deep guide path and query string");

    const httpResponse = await page.request.get("http://progamefinds.online", { maxRedirects: 0 });
    const httpLocation = httpResponse.headers()["location"] || "";
    const httpTarget = httpLocation ? new URL(httpLocation, "http://progamefinds.online") : null;
    check([301, 308].includes(httpResponse.status()) && httpTarget?.origin === "https://progamefinds.online" && httpTarget.pathname === "/", "HTTP root redirects to HTTPS");

    // Trace each redirect hop explicitly. This identifies whether a failure is
    // in HTTP www, HTTP-to-HTTPS, www-to-root, or the final deep-page response.
    // Cloudflare Pages normalizes legacy .html routes to clean extensionless URLs after the host redirect.
    const expectedFinal = new URL("https://progamefinds.online" + deepPath.replace(/\.html$/, "") + deepQuery);
    let nextURL = new URL("http://www.progamefinds.online" + deepPath + deepQuery);
    const redirectTrace = [];
    let finalResponse;
    for (let hop = 0; hop <= 10; hop++) {
      const hopResponse = await page.request.get(nextURL.toString(), { maxRedirects: 0 });
      const location = hopResponse.headers()["location"] || "";
      redirectTrace.push({ status: hopResponse.status(), url: nextURL.toString(), location: location || null });
      if (![301, 302, 303, 307, 308].includes(hopResponse.status()) || !location) {
        finalResponse = hopResponse;
        break;
      }
      nextURL = new URL(location, nextURL);
    }

    const traceSummary = JSON.stringify(redirectTrace);
    const redirectHops = redirectTrace.slice(0, -1);
    const chainIsPermanent = redirectHops.every(hop => [301, 308].includes(hop.status));
    const finalURL = new URL(redirectTrace.at(-1).url);
    const chainPasses = Boolean(finalResponse && finalResponse.ok() && chainIsPermanent &&
      finalURL.origin === expectedFinal.origin && finalURL.pathname === expectedFinal.pathname &&
      finalURL.search === expectedFinal.search);
    check(chainPasses, "HTTP www redirect chain ends at canonical HTTPS URL with path and query preserved" + (chainPasses ? "" : ": " + traceSummary));
  }
  check((await page.title()).includes("ProGameFinds"), "Homepage title identifies ProGameFinds");
  check(await page.locator('meta[name="description"]').count() === 1, "Homepage has exactly one meta description");

  // Assert the user-visible retailer destination, not an implementation-only CSS class.
  // This also works with server-rendered cards and dynamically rendered cards.
  const productLinks = page.locator('.card a[href^="https://www.amazon.com/s?k="]');
  const productLinkCount = await productLinks.count();
  check(productLinkCount === 22, "All 22 catalogue products have a retailer search link");
  const everyCardHasExactlyOneRetailerLink = await page.locator(".card").evaluateAll(cards =>
    cards.length === 22 && cards.every(card =>
      card.querySelectorAll('a[href^="https://www.amazon.com/s?k="]').length === 1
    )
  );
  check(everyCardHasExactlyOneRetailerLink, "Every catalogue card has exactly one retailer search link");
  let productLinksValid = productLinkCount === 22;
  for (let i = 0; i < productLinkCount; i++) {
    const link = productLinks.nth(i);
    const href = await link.getAttribute("href") || "";
    const rel = await link.getAttribute("rel") || "";
    const target = await link.getAttribute("target");
    const label = await link.innerText();
    if (!href.startsWith("https://www.amazon.com/s?k=") || href.includes("tag=") || !rel.includes("noopener") || !rel.includes("nofollow") || target !== "_blank" || label !== "Search Amazon listings") productLinksValid = false;
  }
  check(productLinksValid, "All product links are safe, non-affiliate Amazon search links with no unverified ASINs");
  check((await page.locator(".card .asin").count()) === 22, "Every catalogue card warns visitors to verify model, seller and availability");

  const aboutLinks = page.locator('nav[aria-label="Primary"] a[href="/about.html"]');
  check(await aboutLinks.count() === 1, "Primary navigation contains one About link (no duplicate)");

  check(await page.locator('a[href^="mailto:support@progamefinds.online"]').count() === 1, "Direct support email link is present");
  const productArt = page.locator(".card img.card-ic");
  check(await productArt.count() === 22, "All 22 catalogue cards include illustrative artwork");
  await productArt.evaluateAll(images => images.forEach(image => { image.loading = "eager"; }));
  await page.waitForFunction(() => [...document.querySelectorAll("img.product-art")].every(image => image.complete), null, { timeout: 15000 });
  const allArtworkLoaded = await productArt.evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0));
  check(allArtworkLoaded, "All catalogue artwork files load successfully");

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
  check(await page.locator('.card:visible a[href^="https://www.amazon.com/s?k="]').count() === 22, "All 22 product search links remain visible after clearing filters");

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

  const expectedBlockedAnalytics = consoleErrors.filter(message =>
    message.includes("static.cloudflareinsights.com/beacon.min.js") &&
    message.includes("Content Security Policy") &&
    message.includes("script-src 'self'")
  );
  const unexpectedConsoleErrors = consoleErrors.filter(message => !expectedBlockedAnalytics.includes(message));
  check(unexpectedConsoleErrors.length === 0, "Browser console has no unexpected errors" + (unexpectedConsoleErrors.length ? ": " + unexpectedConsoleErrors.join(" | ") : ""));
  if (expectedBlockedAnalytics.length) {
    console.log("PASS Cloudflare analytics beacon is blocked by the site's strict CSP as intended");
  }
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
