# Product image rights and integration plan

## Scope and safety

This implementation is staging-only. Do not change `main`, production assets, Cloudflare settings, DNS, affiliate credentials, or publish product photographs until each exact product, source, and usage right is verified.

The catalogue contains 22 entries. Existing `/assets/products/*.svg` files are original category illustrations, not photographs of the exact products. Keep these files as safe fallbacks.

## Approved image-source order

1. **Amazon Creators API**: use only after the Associates account has final approval, API access is granted, and the account is eligible. Request `images.primary.large` for a verified US-marketplace ASIN using the account's own credentials and partner tag. Render the returned image URL directly; do not download or permanently host the image.
2. **Manufacturer press/media assets**: use only when an explicit licence or written permission covers commercial affiliate-site display, the website's mobile/responsive use where applicable, and the intended image delivery method.
3. **Commissioned/licensed photography or UGC**: use only with written commercial web-use permission covering this site, creator/source details, and proof of licence or permission. Authentic UGC and AI-created content must never be represented as official product photography or genuine customer UGC.

Do not use Google Images, retailer-page scraping, Amazon page scraping, copied marketplace images, Pinterest, or unattributed social posts. A publicly accessible or downloadable image is not automatically licensed. Verify any Creative Commons licence and its commercial-use and attribution conditions.

## Per-product release gate

Before replacing a fallback illustration, record:
- exact product model and variant verified against the manufacturer;
- exact Amazon ASIN-to-model mapping verified against the live product detail page;
- live listing, seller, and variant checked;
- image source URL and source owner;
- licence/permission type, proof reference, date checked, and required attribution;
- confirmation that the source permits commercial affiliate-site display, mobile/responsive use where required, and hotlinking/hosting as implemented;
- final approved image URL and exact related Amazon detail-page link.

If any field is unknown, keep the original category illustration. Never label an illustration as a real product photo.

## Amazon Creators API compliance gate

- Amazon's US onboarding requires final acceptance into Associates. PA API access through Creators API additionally requires at least 10 qualifying sales in the trailing 30 days; API eligibility can be reviewed and may take up to 48 hours.
- Credentials must remain server-side in secret storage; never commit keys or expose them to browser JavaScript. Use Amazon's official SDK/authentication flow.
- Request only the primary large image for each verified ASIN.
- Amazon's US policy says Product Advertising Content must link to the relevant Amazon page. It also restricts use on sites designed or intended for mobile phones without express prior written approval. Because this site is responsive, obtain Amazon's written clarification/approval for mobile-site use before enabling Creators API images.
- Do not cache or store image content. Amazon policy permits storing an image URL link for no more than 24 hours. Do not copy API image files into this repository or Cloudflare assets.
- If access is unavailable, returns an eligibility error, an image URL is stale/missing, or an ASIN cannot be verified, serve the existing original SVG fallback.
- Keep the Amazon image linked to the exact matching ASIN page and preserve the Associates tracking tag/URL parameters.

## Automated release audit

`scripts/audit-product-image-rights.mjs` checks all 22 product cards for exactly one image each, verifies fallback illustration files and alt text, and blocks exact photos unless model/ASIN/listing/seller/variant, source permission, API eligibility, mobile-site approval, fresh image URL, and matching affiliate destination are all recorded. The audit runs in the professional GitHub Actions workflow.

## Current status (2026-11-21)

- The account portal showed that an approved Associates account is required; Creators API access is not confirmed.
- Candidate ASIN-to-model mappings remain unverified and manufacturer image permissions remain unconfirmed.
- No exact-product photograph is approved for release. The original illustration fallbacks remain in place by design.
- This work is staging-only; production remains unchanged.
