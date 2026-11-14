import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const html = readFileSync(resolve(root, "index.html"), "utf8");
const errors = [];
const warnings = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
check(/<title>[^<]+<\/title>/i.test(html), "Missing page title");
check(/<meta name="description" content="[^"]{40,}">/i.test(html), "Missing or too-short meta description");
check(/<link rel="canonical" href="https:\/\/progamefinds\.online\/?">/i.test(html), "Canonical URL missing or incorrect");
check(/property="og:title"/i.test(html) && /property="og:description"/i.test(html), "Open Graph title/description missing");
check(/application\/ld\+json/i.test(html), "Structured data missing");
check(html.includes("As an Amazon Associate I earn from qualifying purchases."), "Exact Amazon Associate disclosure missing");
check(/Amazon Associates application pending/i.test(html) && /not yet approved/i.test(html), "Pending application status must be clear on the homepage");
const amazonAnchors = [...html.matchAll(/<a\b([^>]*href="https?:\/\/www\.amazon\.com\/[^"]+"[^>]*)>([\s\S]*?)<\/a>/gi)];
check(amazonAnchors.length === 22, `Expected 22 Amazon links, found ${amazonAnchors.length}`);
for (const [i, m] of amazonAnchors.entries()) {
  const attrs = m[1], content = m[2];
  check(/tag=progamefinds-20/i.test(attrs), `Amazon link ${i+1} missing expected tracking tag`);
  check(/rel="[^"]*sponsored[^"]*"/i.test(attrs), `Amazon link ${i+1} missing rel=sponsored`);
  check(/\(paid link\)/i.test(content), `Amazon link ${i+1} missing nearby paid-link disclosure`);
  check(/target="_blank"/i.test(attrs) ? /rel="[^"]*noopener[^"]*"/i.test(attrs) : true, `Amazon link ${i+1} opens new tab without noopener`);
}
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
for (const m of html.matchAll(/href="#([^"]+)"/g)) check(ids.has(m[1]), `Broken in-page anchor #${m[1]}`);
const guidePaths = [
"guides/choosing-a-gaming-mouse.html","guides/gaming-keyboard-layouts-and-switches.html",
"guides/choosing-a-gaming-headset.html","guides/controller-compatibility-checklist.html",
"guides/gaming-desk-sizing-guide.html","guides/gaming-chair-fit-and-ergonomics.html",
"guides/gaming-room-lighting.html","guides/building-a-balanced-gaming-setup.html",
"guides/wired-vs-wireless-gaming-gear.html","guides/how-to-check-an-online-product-listing.html"
];
for (const path of guidePaths) check(existsSync(resolve(root,path)), `Missing original guide: ${path}`);
check(existsSync(resolve(root,"robots.txt")), "robots.txt missing");
check(existsSync(resolve(root,"sitemap.xml")), "sitemap.xml missing");
if (html.includes("REPLACE_WITH_WEB3FORMS_ACCESS_KEY") || html.includes("OWNER_EMAIL_ADDRESS")) warnings.push("Contact form remains unconfigured: owner must supply a valid Web3Forms access key and destination inbox.");
if (errors.length) { console.error("FAIL", errors.join("\n- ")); process.exit(1); }
console.log(`PASS: ${amazonAnchors.length} tagged Amazon links include sponsored rel and (paid link); disclosure, SEO, internal anchors, 10 guides, robots.txt and sitemap are present.`);
for (const warning of warnings) console.warn("OWNER ACTION:", warning);
