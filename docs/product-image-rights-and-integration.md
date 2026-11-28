# Product image rights and integration plan

## Scope and safety
This implementation is staging-only. Do not change main, production assets, Cloudflare settings, DNS, affiliate credentials, or publish product photographs until each exact product, source, and usage right is verified.

The catalogue contains 30 candidate entries. Existing /assets/products/*.svg files are original category illustrations, not photographs of exact products. Keep them as safe fallbacks.

## Original brand illustrations
- assets/brand/hero-showcase.svg is original vector artwork created for the ProGameFinds visual identity refresh.
- It depicts generic gaming gear as a conceptual brand scene. It does not depict a verified retail SKU, exact controller model, real-world product photograph, or official manufacturer image.
- It contains no copied third-party product photography, retailer imagery, logos or customer-submitted content.
- It is a brand/hero illustration only, never evidence for a product candidate.
- Logo and social SVGs under assets/brand/ and assets/social-preview.svg are original brand artwork.

## Approved product-image source order
1. Amazon Creators API: use only after the Associates account has final approval, API access is granted, and the account is eligible. Request the primary image for a verified ASIN using the account's own credentials and partner tag. Do not download or permanently host API image content.
2. Manufacturer press/media assets: use only when an explicit licence or written permission covers commercial website display, responsive use and the intended delivery method.
3. Commissioned/licensed photography or UGC: use only with written commercial web-use permission, creator/source details and proof of licence. AI-created content must never be represented as official product photography or genuine customer UGC.

Do not use Google Images, retailer-page scraping, Amazon page scraping, copied marketplace images, Pinterest or unattributed social posts. A publicly accessible image is not automatically licensed.

## Per-product release gate
Before replacing a fallback illustration, record exact model and variant, ASIN-to-model mapping, live listing/seller/variant, image source and owner, licence/permission proof, date checked, required attribution, permitted commercial and mobile use, and the matching exact retailer destination. If any field is unknown, keep the original illustration.

## Amazon Creators API compliance gate
- API use requires final Associates acceptance and current API eligibility.
- Credentials must remain server-side; never commit keys or expose them to browser JavaScript.
- Confirm applicable Amazon mobile-site permissions before enabling API images on a responsive site.
- Do not cache or store image content. Follow Amazon's current image URL retention policy.
- If access is unavailable, a URL is stale/missing, or an ASIN cannot be verified, serve the existing original SVG fallback.

## Automated release audit
scripts/audit-product-image-rights.mjs checks product imagery, alt text and fallback files, and blocks exact photos unless model/ASIN/listing/seller/variant, source permission, API eligibility, mobile approval and matching destination are recorded.

## Current status (2026-11-28)
- No exact-product photograph is approved for release. Original illustration fallbacks remain in place by design.
- Original brand artwork is separate from product verification evidence.
- This visual refresh is preview-only until desktop/mobile QA and production review gates pass.
