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
check(/Amazon Associates application pending/i.test(html), "Homepage must clearly state the current pending-application notice");
check(html.includes("As an Amazon Associate I earn from qualifying purchases."), "Exact Amazon Associate disclosure missing");
check(/href="\/assets\/site\.css"/i.test(html) && existsSync(resolve(root,"assets/site.css")), "Local stylesheet missing");
check(/src="\/assets\/site\.js"/i.test(html) && existsSync(resolve(root,"assets/site.js")), "Local JavaScript file missing");
check(!/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html), "Remote Google Fonts request remains");
check(!/Google Fonts|Web3Forms/i.test(html), "Homepage contains a stale third-party font/form provider claim");
check(!/Use the contact form on this page\\. Include your email address so we can reply\\./i.test(html), "FAQ claims the disabled contact form can receive messages");
check(/Last updated November 19, 2026/i.test(html), "Homepage policy update date is stale");
check(/data-filter="mice"/.test(html) && /id="gear-search"/.test(html), "Accessible product search/filter controls missing");
check(/Contact intake is not active yet/.test(html) && /type="submit" disabled/.test(html), "Inactive contact form must be clearly and safely disabled");
check(!/REPLACE_WITH_WEB3FORMS_ACCESS_KEY|OWNER_EMAIL_ADDRESS/.test(html), "Contact form placeholder configuration remains in homepage");

// Validate every Amazon link without fetching or scraping Amazon pages.
const amazonAnchors = [...html.matchAll(/<a\b([^>]*href="https?:\/\/www\.amazon\.com\/[^"]+"[^>]*)>([\s\S]*?)<\/a>/gi)];
check(amazonAnchors.length === 22, `Expected 22 existing Amazon outbound links, found ${amazonAnchors.length}`);
for (const [i, match] of amazonAnchors.entries()) {
  const attrs = match[1], body = match[2];
  check(/tag=progamefinds-20/i.test(attrs), `Amazon link ${i+1} missing the existing progamefinds-20 tag`);
  check(/rel="[^"]*sponsored[^"]*"/i.test(attrs), `Amazon link ${i+1} missing rel=sponsored`);
  check(/rel="[^"]*noopener[^"]*"/i.test(attrs), `Amazon link ${i+1} opens in a new tab without noopener`);
  check(/\(paid link\)/i.test(body), `Amazon link ${i+1} missing adjacent (paid link) disclosure`);
}

// Verify all guide pages and dedicated information pages.
const requiredPages = [
  "about.html","affiliate-disclosure.html","privacy.html","terms.html",
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
for (const path of ["about.html","affiliate-disclosure.html","privacy.html","terms.html"]) {
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

// The following items cannot be confirmed from public source code.
warnings.push("OWNER CHECK: Confirm in Associates Central that the account is accepted/pending and that progamefinds-20 is the active tracking ID before public promotion.");
warnings.push("OWNER CHECK: Verify each ASIN-to-product match, model revision, seller, compatibility and warranty with manufacturer and live retailer sources.");
warnings.push("OWNER CHECK: Contact form remains disabled until a destination inbox and delivery provider are confirmed, configured and delivery-tested.");
warnings.push("OWNER CHECK: Verify root/www DNS, HTTPS certificate and canonical redirects after nameserver propagation.");
warnings.push("OWNER CHECK: Complete Search Console ownership verification and submit sitemap after the canonical domain is live.");

if (errors.length) {
  console.error("FAIL");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log(`PASS: ${amazonAnchors.length} Amazon links have the existing tag, sponsored rel, noopener and paid-link disclosure; SEO, pending notice, ${requiredPages.length} editorial/legal pages, sitemap, robots and security headers are present.`);
for (const warning of warnings) console.warn("OWNER ACTION:", warning);
