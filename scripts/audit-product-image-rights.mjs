#!/usr/bin/env node
import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const fail = (message) => errors.push(message);
const exists = async (path) => {
  try { await access(path, constants.R_OK); return true; } catch { return false; }
};

const manifest = JSON.parse(await readFile(resolve(root, "data/product-verification.json"), "utf8"));
const homepage = await readFile(resolve(root, "index.html"), "utf8");
const renderer = await readFile(resolve(root, "assets/site.js"), "utf8");
const products = manifest.products ?? [];

if (!Array.isArray(products) || products.length !== manifest.catalogue_count) {
  fail("Catalogue count mismatch: declared " + manifest.catalogue_count + ", found " + products.length);
}
if (!/function makeCard/.test(renderer) || !/product\.image_rights/.test(renderer) || !/card-ic/.test(renderer)) {
  fail("Dynamic catalogue renderer must create product cards from the evidence register.");
}
if (!/product-retailer-link/.test(renderer)) {
  fail("Dynamic catalogue renderer must provide a retailer search link for each product.");
}
if (!/id="categories"/.test(homepage) || !/id="gear-search"/.test(homepage)) {
  fail("Homepage product catalogue or search control is missing.");
}

let checkedIllustrations = 0;
for (const [index, product] of products.entries()) {
  const rights = product.image_rights ?? {};
  const name = product.product_name ?? ("Product " + (index + 1));
  const asset = rights.illustration_asset ?? "";

  if (!asset.startsWith("/assets/products/")) {
    fail(name + ": illustration must be a local product-category asset.");
    continue;
  }
  if (rights.illustration_only !== true || rights.publish_illustration !== true ||
      rights.publish_exact_product_photo !== false) {
    fail(name + ": keep original category illustration enabled and exact product photography disabled until rights are verified.");
  }
  if (rights.illustration_rights !== "original artwork created for this site") {
    fail(name + ": illustration rights must be documented as original site artwork.");
  }
  if (rights.manufacturer_asset_permission === "confirmed" || rights.licensed_ugc === "confirmed") {
    // A future exact-photo release requires a separate documented audit path.
    fail(name + ": exact-photo permission is marked confirmed but the current release still uses the illustration-only workflow.");
  }
  const localAsset = resolve(root, asset.slice(1));
  if (!(await exists(localAsset))) {
    fail(name + ": original illustration asset is missing: " + asset);
  } else {
    checkedIllustrations += 1;
  }
  if (product.retailer_listing?.asin_to_model_mapping_status === "verified" &&
      product.retailer_listing?.live_listing_status !== "checked") {
    fail(name + ": ASIN cannot be verified without a checked live listing.");
  }
}

if (/amazon\.com\/(?:dp|gp\/product)\//i.test(renderer)) {
  fail("Renderer must not publish direct ASIN product links while mappings remain unverified.");
}
if (/tag=progamefinds-20/i.test(renderer)) {
  fail("Renderer must not publish affiliate tracking tags while approval is unconfirmed.");
}

if (errors.length) {
  console.error("PRODUCT IMAGE RIGHTS AUDIT: FAIL");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  console.log("PRODUCT IMAGE RIGHTS AUDIT: PASS");
  console.log("Catalogue entries checked: " + products.length);
  console.log("Local original illustrations checked: " + checkedIllustrations);
  console.log("Exact product photography enabled: 0");
  console.log("No unverified or unlicensed exact-product photo is enabled.");
}
