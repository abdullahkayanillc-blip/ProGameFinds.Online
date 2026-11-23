import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");
const errors = [];
const warnings = [];
const check = (ok, message) => { if (!ok) errors.push(message); };

const html = read("index.html");
const title = /<title>[^<]+<\/title>/i.test(html);
check(title, "Homepage title missing");
check(/<meta name="description" content="[^"]{40,}">/i.test(html), "Homepage meta description missing or too short");
check(/<link rel="canonical" href="https:\/\/progamefinds\.online\/?">/i.test(html), "Homepage canonical URL missing or incorrect");
check(/property="og:title"/i.test(html) && /property="og:description"/i.test(html), "Open Graph metadata missing");
check(/property="og:image"/i.test(html) && existsSync(resolve(root,"assets/social-preview.svg")), "Social share artwork missing");
check(/application\/ld\+json/i.test(html), "WebSite structured data missing");
check(!/<[a-z][^>]*\sstyle=/i.test(html), "Inline style attributes violate the strict site CSP");
check(/Amazon Associates approval has not been confirmed/i.test(html), "Homepage must clearly state that Amazon Associates approval is unconfirmed");
check(/Product buttons are ordinary retailer search links and do not currently earn commissions/i.test(html), "Homepage must accurately state that current product links are non-affiliate");
check(!html.includes("As an Amazon Associate I earn from qualifying purchases."), "Unapproved site must not claim Amazon Associate status");
check(/href="\/assets\/site\.css"/i.test(html) && existsSync(resolve(root,"assets/site.css")), "Local stylesheet missing");
check(/src="\/assets\/site\.js(?:\?[^"]*)?"/i.test(html) && existsSync(resolve(root,"assets/site.js")), "Local JavaScript file missing");
check(!/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html), "Remote Google Fonts request remains");
check(!/Google Fonts|Web3Forms/i.test(html), "Homepage contains a stale third-party font/form provider claim");
check(!/Use the contact form on this page\\. Include your email address so we can reply\\./i.test(html), "FAQ claims the disabled contact form can receive messages");
check(/Last updated November 23, 2026/i.test(html), "Homepage policy update date is stale");
check(/data-filter="mice"/.test(html) && /id="gear-search"/.test(html), "Accessible product search/filter controls missing");
check(/On-page form submissions are not active/.test(html) && /type="submit" disabled/.test(html), "Inactive contact form must be clearly and safely disabled");
check(!/REPLACE_WITH_WEB3FORMS_ACCESS_KEY|OWNER_EMAIL_ADDRESS/.test(html), "Contact form placeholder configuration remains in homepage");

// Product links are ordinary non-affiliate Amazon search links until approval and exact listing mappings are verified.
const productRegister = JSON.parse(read("data/product-verification.json"));
check(productRegister.products.length === 22, "Expected 22 catalogue candidates in the evidence register");
check(/product-retailer-link/.test(read("assets/site.js")), "Dynamic product cards must include a retailer search link");
check(!/tag=progamefinds-20/i.test(html + read("assets/site.js")), "Unapproved site must not publish affiliate tracking tags");
check(/Amazon Associates approval has not been confirmed/i.test(read("affiliate-disclosure.html")), "Affiliate disclosure must accurately state pending approval");

// Verify all guide pages and dedicated information pages.
const requiredPages = [
  "about.html","affiliate-disclosure.html","privacy.html","terms.html",
  "gaming-mice.html","gaming-keyboards.html","gaming-headsets.html","gaming-controllers.html",
  "gaming-chairs-desks.html","gaming-room-setup.html","collections.html","guides.html","support.html",
  "guides/choosing-a-gaming-mouse.html","guides/gaming-keyboard-layouts-and-switches.html",
  "guides/choosing-a-gaming-headset.html","guides/controller-compatibility-checklist.html",
  "guides/gaming-desk-sizing-guide.html","guides/gaming-chair-fit-and-ergonomics.html",
  "guides/gaming-room-lighting.html","guides/building-a-balanced-gaming-setup.html",
  "guides/wired-vs-wireless-gaming-gear.html","guides/how-to-check-an-online-product-listing.html"
];
for (const path of requiredPages) {
  check(existsSync(resolve(root,path)), `Missing required editorial/legal page: ${path}`);
  if (existsSync(resolve(root,path)) && path.endsWith(".html")) {
    const page = read(path);
    check(/<title>[^<]+<\/title>/i.test(page), `Missing title: ${path}`);
    check(/rel="canonical"/i.test(page), `Missing canonical: ${path}`);
  }
}

const sitemap = read("sitemap.xml");
for (const path of ["about.html","affiliate-disclosure.html","privacy.html","terms.html","gaming-mice.html","gaming-keyboards.html","gaming-headsets.html","gaming-controllers.html","gaming-chairs-desks.html","gaming-room-setup.html","collections.html","guides.html","support.html"]) {
  check(sitemap.includes(`https://progamefinds.online/${path}`), `Sitemap missing ${path}`);
}
check(existsSync(resolve(root,"robots.txt")), "robots.txt missing");
check(existsSync(resolve(root,"_headers")), "Cloudflare Pages security headers file missing");
const headerRules = read("_headers");
for (const header of ["X-Content-Type-Options","Referrer-Policy","X-Frame-Options","Content-Security-Policy"]) {
  check(headerRules.includes(header), `Security header missing: ${header}`);
}
check(/Sitemap: https:\/\/progamefinds\.online\/sitemap\.xml/.test(read("robots.txt")), "robots.txt sitemap pointer missing");

// Check in-page anchors.
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
for (const match of html.matchAll(/href="#([^"]+)"/g)) check(ids.has(match[1]), `Broken in-page anchor #${match[1]}`);

for (const path of requiredPages.filter((item) => item.startsWith("guides/"))) {
  if (existsSync(resolve(root,path))) check(!read(path).includes("As an Amazon Associate I earn from qualifying purchases."), `Unapproved affiliate earnings claim must not appear in ${path}`);
}

// The following items cannot be confirmed from public source code.
warnings.push("OWNER CHECK: Do not publish affiliate tracking links or commission claims until the account owner confirms legal eligibility and written program approval.");
warnings.push("OWNER CHECK: Verify each ASIN-to-product match, model revision, seller, compatibility and warranty with manufacturer and live retailer sources.");
warnings.push("OWNER CHECK: On-page contact form remains disabled pending a delivery backend; direct email link is available at support@progamefinds.online.");
warnings.push("OWNER CHECK: Verify root/www DNS, HTTPS certificate and canonical redirects after nameserver propagation.");
warnings.push("OWNER CHECK: Complete Search Console ownership verification and submit sitemap after the canonical domain is live.");

if (errors.length) {
  console.error("FAIL");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log(`PASS: ${productRegister.products.length} product candidates have evidence-register entries; non-affiliate search-link controls, SEO, unconfirmed approval notice, ${requiredPages.length} editorial/legal pages, sitemap, robots and security headers are present.`);
for (const warning of warnings) console.warn("OWNER ACTION:", warning);
