# Product image rights and integration plan

## Scope and safety

This work is staged only. Do not change `main`, production assets, Cloudflare settings, DNS, affiliate credentials, or publish product photographs until the source and usage rights for each exact product are verified.

The catalogue currently contains 22 entries. Existing `/assets/products/*.svg` files are original category illustrations, not photographs of the exact products. Keep them as the safe fallback.

## Approved image-source order

1. **Amazon Creators API**: use only after the Associates account is approved and Amazon grants API access. Request `images.primary.large` for a verified ASIN in the US marketplace, using the account's own credentials and partner tag. Render the returned image URL directly and link that image only to the corresponding Amazon product detail page. Do not download or permanently host the image.
2. **Manufacturer press/media assets**: use only when the manufacturer publishes an explicit licence that permits this website's commercial/affiliate display, or written permission is retained. A public product page or a downloadable image is not, by itself, permission.
3. **Commissioned/licensed photography**: use only with a written commercial web-use licence covering this site, plus source, creator, licence, and proof-of-purchase/permission records.

Do not use Google Images, retailer-page scraping, Amazon page scraping, copied marketplace images, Pinterest, or unattributed social posts as image sources. Do not assume that a Creative Commons licence permits commercial use; verify the exact licence and attribution requirements.

## Per-product release gate

Before replacing a fallback illustration, record:
- exact product model and variant verified against the manufacturer;
- exact Amazon ASIN-to-model mapping verified against the live product detail page;
- image source URL and source owner;
- licence/permission type, URL or document reference, date checked, and required attribution;
- whether the source permits commercial affiliate-site display and hotlinking/hosting;
- final approved image URL and the exact related Amazon detail-page link.

If any field is unknown, keep the original category illustration. Never label an illustration as a real product photo.

## Creators API implementation requirements

- Credentials must remain server-side in secret storage; never commit keys or expose them to browser JavaScript.
- Use the official SDK/request signing flow; do not invent or bypass authentication.
- Request only the primary large image for each verified ASIN.
- Follow Amazon's current licence, marketplace, rate, attribution, link, and image-refresh rules.
- Amazon's current policy prohibits caching/storing image content; a link to image content may be stored for no more than 24 hours. Do not copy API image files into this repository or Cloudflare assets.
- If API access is unavailable, returns an eligibility error, or an ASIN cannot be verified, return the existing original SVG fallback.
- Each Amazon-provided image must link to its corresponding Amazon product detail page without altering API-vended tracking parameters where applicable.

## Current status (2026-11-21)

- Creators API eligibility has not been confirmed; the owner-facing portal indicated an approved Associates account is required.
- The current catalogue register marks the candidate ASIN-to-model mappings as unverified and manufacturer image permission as unconfirmed.
- Therefore, no exact-product photo is approved for release yet. This is intentional: it prevents unlicensed or mismatched images from being published.
- This document and any related checks are staging-only; production remains unchanged.
