import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];
const check = (condition, message) => condition ? null : errors.push(message);
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const files = walk(root).filter((path) => !path.includes("/.git/"));
const htmlFiles = files.filter((path) => extname(path).toLowerCase() === ".html");
const bytes = (path) => statSync(path).size;
const read = (path) => readFileSync(path, "utf8");
const relativePath = (path) => relative(root, path).replaceAll("\\", "/");

check(htmlFiles.length >= 14, "Expected the homepage, legal pages and buying guides to exist.");
check(existsSync(join(root, "data/product-verification.json")), "Product verification manifest is missing.");
check(existsSync(join(root, "scripts/validate-site.mjs")), "Existing compliance validator is missing.");

let checkedLocalRefs = 0;
let checkedImages = 0;
for (const file of htmlFiles) {
  const html = read(file);
  const page = relativePath(file);
  check(/<html\b[^>]*lang=/i.test(html), page + ": missing document language.");
  check(/<title>[^<]+<\/title>/i.test(html), page + ": missing page title.");
  check(/<meta\s+name=["']description["']/i.test(html), page + ": missing meta description.");
  check(/<meta\s+name=["']viewport["']/i.test(html), page + ": missing responsive viewport.");

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((m) => m[1]);
  check(new Set(ids).size === ids.length, page + ": duplicate element IDs found.");

  for (const match of html.matchAll(/<(?:a|img|script|link)\b[^>]*?(?:href|src)=["']([^"'#]+)["'][^>]*>/gi)) {
    const tag = match[0];
    const ref = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(ref)) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (!clean || clean === "/") continue;
    const target = clean.startsWith("/") ? join(root, clean.slice(1)) : resolve(dirname(file), clean);
    checkedLocalRefs++;
    check(existsSync(target), page + ": broken local reference " + ref);
    if (/<img\b/i.test(tag)) {
      checkedImages++;
      check(/\balt=["']/i.test(tag), page + ": image is missing alt text (" + ref + ").");
      check(/\bwidth=["']\d+["']/i.test(tag) && /\bheight=["']\d+["']/i.test(tag), page + ": image should declare width and height (" + ref + ").");
    }
  }
}

const manifest = JSON.parse(read("data/product-verification.json"));
check(manifest.schema_version === 1, "Product verification manifest schema is not supported.");
check(Array.isArray(manifest.products) && manifest.products.length > 0, "No products are recorded in the verification manifest.");
for (const product of manifest.products ?? []) {
  check(Boolean(product.manufacturer_source), product.product_name + ": manufacturer source missing.");
  check(product.retailer_listing?.asin_to_model_mapping_status !== "verified" || product.retailer_listing?.live_listing_status === "checked", product.product_name + ": ASIN cannot be verified without a checked live listing.");
  if (product.image_rights?.manufacturer_asset_permission !== "confirmed" && product.image_rights?.licensed_ugc !== "confirmed") {
    warnings.push(product.product_name + ": no confirmed product-image licence/UGC release; keep product image unpublished.");
  }
}

for (const asset of ["assets/site.css", "assets/site.js", "_headers", "robots.txt", "sitemap.xml"]) {
  check(existsSync(join(root, asset)), "Required site asset missing: " + asset);
}
const css = join(root, "assets/site.css");
const js = join(root, "assets/site.js");
if (existsSync(css)) check(bytes(css) <= 100 * 1024, "CSS exceeds the 100 KB raw-size budget.");
if (existsSync(js)) check(bytes(js) <= 60 * 1024, "JavaScript exceeds the 60 KB raw-size budget.");

const home = read("index.html");
check(home.includes("As an Amazon Associate I earn from qualifying purchases."), "Exact Amazon Associates disclosure missing.");
check(/Amazon Associates application pending/i.test(home), "Amazon application status notice missing.");
check(!/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(home), "Remote Google Fonts dependency detected.");
check(/data-filter=["']mice["']/i.test(home) && /id=["']gear-search["']/i.test(home), "Search and category-filter controls are missing.");

if (errors.length) {
  console.error("PROFESSIONAL QUALITY AUDIT: FAIL");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log("PROFESSIONAL QUALITY AUDIT: PASS");
console.log("HTML pages: " + htmlFiles.length + "; local references checked: " + checkedLocalRefs + "; image elements checked: " + checkedImages);
console.log("Raw CSS: " + (existsSync(css) ? bytes(css) : 0) + " bytes; raw JS: " + (existsSync(js) ? bytes(js) : 0) + " bytes");
for (const warning of warnings) console.warn("REVIEW REQUIRED:", warning);
