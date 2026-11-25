import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const errors = [];
const read = (path) => readFileSync(resolve(root, path), "utf8");
const check = (condition, message) => { if (!condition) errors.push(message); };

const manifest = JSON.parse(read("data/product-verification.json"));
const home = read("index.html");
const catalogue = read("gaming-products.html");
const stylesheet = read("assets/gaming-3d.css");
const logo = "assets/brand/progamefinds-logo-horizontal.svg";

check(manifest.status === "gaming_catalogue_restored_retailer_verification_pending", "Gaming evidence manifest status mismatch");
check(manifest.candidate_products.length === 30, "Expected 30 gaming product candidates in the evidence manifest");
check(manifest.candidate_products.every((p) =>
  p.status === "candidate_not_verified" &&
  p.asin === null && p.seller === null && p.variant === null &&
  p.retailer_url === null && p.price === null && p.availability === null
), "A product candidate is incorrectly marked as retailer-verified");
check(manifest.outbound_link_policy.special_links_enabled === false, "Unverified Amazon Special Links must remain disabled");
check(manifest.outbound_link_policy.associate_tag === null, "An unverified Associates tracking ID must not be stored");
check(manifest.outbound_link_policy.commission_claims_enabled === false, "Unverified commission claims must remain disabled");

check(existsSync(resolve(root, logo)), "ProGameFinds brand logo is missing");
check(/gaming-3d\.css/.test(home), "Gaming design stylesheet is not loaded");
check(/Amazon affiliate tracking is not active/i.test(home), "Homepage must disclose that affiliate tracking is inactive");
check(/Amazon affiliate tracking is not active|No affiliate tracking is currently active/i.test(catalogue), "Catalogue must disclose inactive affiliate tracking");

const cards = [...catalogue.matchAll(/<article class="product-card">[\s\S]*?<\/article>/g)].map((m) => m[0]);
check(cards.length === 30, "Expected 30 product candidate cards in the catalogue");
check(manifest.candidate_products.length === cards.length, "Catalogue and evidence manifest candidate counts differ");
for (const [index, card] of cards.entries()) {
  const link = card.match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
  check(!!link, `Product card ${index + 1} is missing its outbound research link`);
  if (link) {
    check(/^https:\/\/www\.amazon\.com\/s\?k=/.test(link[1]), `Product card ${index + 1} must use a plain Amazon search URL`);
    check(!/[?&](?:tag|ascsubtag|linkCode)=/i.test(link[1]), `Product card ${index + 1} contains an unverified tracking parameter`);
    check(/target="_blank"/i.test(card) && /rel="noopener noreferrer"/i.test(card), `Product card ${index + 1} is missing safe external-link attributes`);
  }
}
check(!/amazon\.com\/dp\//i.test(catalogue), "Unverified direct ASIN links are prohibited");
check(!/[?&]tag=[a-z0-9-]+/i.test(catalogue), "Affiliate tracking tag enabled without verified account status");
check(/ordinary, non-tracking Amazon search links/i.test(catalogue), "Non-tracking retailer-link status must be disclosed");

check(!/assets\/products\//i.test(home + catalogue), "Legacy non-gaming product artwork must not be presented as gaming product photography");
check(stylesheet.length < 30 * 1024, "Gaming stylesheet exceeds 30KB");
check(/prefers-reduced-motion/.test(stylesheet), "Reduced-motion support missing");
check(/:focus-visible/.test(stylesheet), "Visible keyboard-focus treatment missing");

for (const path of ["assets/brand/progamefinds-logo-horizontal.svg", "assets/favicon.svg", "assets/gaming-3d.css", "assets/site.js"]) {
  check(existsSync(resolve(root, path)), "Required public asset missing: " + path);
}

if (errors.length) {
  console.error("GAMING PORTAL ASSET AND LINK-SAFETY AUDIT: FAIL");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log("GAMING PORTAL ASSET AND LINK-SAFETY AUDIT: PASS");
console.log("Candidates: " + cards.length + "; ordinary non-tracking Amazon search links: " + cards.length + "; verified ASINs: 0; active affiliate tags: 0.");
