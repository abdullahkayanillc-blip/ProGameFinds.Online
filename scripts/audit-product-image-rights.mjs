#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const path = new URL("../data/product-verification.json", import.meta.url);
const register = JSON.parse(await readFile(path, "utf8"));
const products = register.products ?? [];
const errors = [];

if (products.length !== register.catalogue_count) {
  errors.push(`Catalogue count mismatch: declared ${register.catalogue_count}, found ${products.length}`);
}

for (const [index, product] of products.entries()) {
  const rights = product.image_rights ?? {};
  const listing = product.retailer_listing ?? {};
  const exactPhotoEnabled = rights.publish_exact_product_photo === true;
  const asinVerified = listing.asin_to_model_mapping_status === "verified";
  const manufacturerPermission = rights.manufacturer_asset_permission === "confirmed";
  const licensedUgc = rights.licensed_ugc === "confirmed";

  if (exactPhotoEnabled && !(asinVerified && (manufacturerPermission || licensedUgc))) {
    errors.push(`Product ${index + 1} (${product.product_name}): exact photo enabled without verified model/ASIN and documented rights`);
  }
  if (rights.publish_illustration === true && !rights.illustration_asset) {
    errors.push(`Product ${index + 1} (${product.product_name}): illustration fallback enabled but asset path is missing`);
  }
  if (!listing.asin && exactPhotoEnabled) {
    errors.push(`Product ${index + 1} (${product.product_name}): exact photo enabled without an ASIN`);
  }
}

if (errors.length) {
  console.error("PRODUCT IMAGE RIGHTS AUDIT: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  const approved = products.filter((product) =>
    product.image_rights?.publish_exact_product_photo === true
  ).length;
  console.log("PRODUCT IMAGE RIGHTS AUDIT: PASS");
  console.log(`Catalogue entries checked: ${products.length}`);
  console.log(`Exact product photos approved: ${approved}`);
  console.log(`Illustration fallbacks retained: ${products.length - approved}`);
  console.log("No unverified or unlicensed exact-product photo is enabled.");
}
