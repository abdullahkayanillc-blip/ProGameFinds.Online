#!/usr/bin/env node
import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);
const exists = async (path) => {
  try { await access(path, constants.R_OK); return true; } catch { return false; }
};
const safeHttps = (value) => {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
};
const parseTime = (value) => {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : NaN;
};

const manifestPath = resolve(root, "data/product-verification.json");
const homepagePath = resolve(root, "index.html");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const homepage = await readFile(homepagePath, "utf8");
const products = manifest.products ?? [];
const cards = [...homepage.matchAll(/<article class="card">([\\s\\S]*?)<\\/article>/g)].map((match) => match[1]);

if (!Array.isArray(products) || products.length !== manifest.catalogue_count) {
  fail(`Catalogue count mismatch: declared ${manifest.catalogue_count}, found ${products.length}`);
}
if (cards.length !== products.length) {
  fail(`Homepage card count (${cards.length}) does not match evidence register (${products.length})`);
}

for (let index = 0; index < products.length; index += 1) {
  const product = products[index];
  const rights = product.image_rights ?? {};
  const listing = product.retailer_listing ?? {};
  const card = cards[index] ?? "";
  const imageTags = [...card.matchAll(/<img\\b[^>]*class="product-art"[^>]*>/gi)].map((match) => match[0]);

  if (imageTags.length !== 1) {
    fail(`${product.product_name}: expected exactly one product image in its card; found ${imageTags.length}`);
    continue;
  }

  const imageTag = imageTags[0];
  const src = imageTag.match(/\\bsrc="([^"]+)"/i)?.[1] ?? "";
  const alt = imageTag.match(/\\balt="([^"]*)"/i)?.[1] ?? "";
  const exactPhoto = rights.publish_exact_product_photo === true;

  if (!src || !alt.trim()) fail(`${product.product_name}: product image requires a source and descriptive alt text`);

  if (!exactPhoto) {
    if (rights.publish_illustration !== true || rights.illustration_only !== true) {
      fail(`${product.product_name}: fallback must be explicitly marked as original illustrative artwork`);
    }
    if (!rights.illustration_asset || src !== rights.illustration_asset) {
      fail(`${product.product_name}: homepage image does not match the approved original illustration fallback`);
    }
    if (!/illustrat|not a photograph/i.test(alt)) {
      fail(`${product.product_name}: illustrative fallback must not be presented as exact product photography`);
    }
    const localAsset = resolve(root, src.replace(/^\\//, ""));
    if (!src.startsWith("/") || !(await exists(localAsset))) {
      fail(`${product.product_name}: original illustration asset is missing or not a local site asset`);
    }
    continue;
  }

  if (product.model_identity_status !== "verified") {
    fail(`${product.product_name}: exact photo blocked until exact model identity is verified`);
  }
  if (listing.asin_to_model_mapping_status !== "verified" || listing.live_listing_status !== "checked" ||
      listing.seller_status !== "checked" || listing.variant_status !== "checked" || !listing.asin) {
    fail(`${product.product_name}: exact photo blocked until ASIN, live listing, seller and variant are verified`);
  }

  const sourceType = rights.image_source_type;
  const imageUrl = rights.image_url;
  const permissionRef = rights.permission_reference;
  if (!safeHttps(imageUrl) || src !== imageUrl) {
    fail(`${product.product_name}: exact photo must use the approved HTTPS source URL without copying it into site assets`);
  }

  if (sourceType === "amazon_creators_api") {
    const api = manifest.creators_api ?? {};
    if (api.access_status !== "approved" || api.mobile_site_permission !== "confirmed") {
      fail(`${product.product_name}: Amazon API image blocked until API eligibility and required mobile-site permission are confirmed`);
    }
    if (!api.partner_tag || !api.credentials_server_side) {
      fail(`${product.product_name}: Amazon API credentials and partner tag must be configured server-side`);
    }
    const fetchedAt = parseTime(rights.image_url_fetched_at);
    const age = Date.now() - fetchedAt;
    if (!Number.isFinite(fetchedAt) || age < 0 || age > 24 * 60 * 60 * 1000) {
      fail(`${product.product_name}: Amazon image URL is missing or older than the 24-hour maximum`);
    }
    const amazonLink = card.match(/<a\\b[^>]*href="([^"]*amazon\\.com[^"]*)"[^>]*>/i)?.[1] ?? "";
    if (!amazonLink.includes(listing.asin) || !amazonLink.includes(api.partner_tag)) {
      fail(`${product.product_name}: Amazon image must link to its exact ASIN page with the approved Associates tag`);
    }
  } else if (sourceType === "manufacturer_licensed" || sourceType === "licensed_ugc") {
    if (!permissionRef || rights.commercial_affiliate_display !== true || rights.permission_status !== "confirmed") {
      fail(`${product.product_name}: licensed photo requires documented permission for commercial affiliate-site display`);
    }
  } else {
    fail(`${product.product_name}: unsupported or missing exact-photo source type`);
  }
}

if (errors.length) {
  console.error("PRODUCT IMAGE RIGHTS AUDIT: FAIL");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  const exact = products.filter((product) => product.image_rights?.publish_exact_product_photo === true).length;
  console.log("PRODUCT IMAGE RIGHTS AUDIT: PASS");
  console.log(`Catalogue entries checked: ${products.length}`);
  console.log(`Exactly one image per product card: ${products.length === cards.length}`);
  console.log(`Verified exact product photos enabled: ${exact}`);
  console.log(`Original illustrative fallbacks retained: ${products.length - exact}`);
  console.log("No unverified, unlicensed, stale, or incorrectly linked exact-product photo is enabled.");
}
