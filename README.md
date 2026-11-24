# ProGameFinds — Fitness Equipment Research Portal

## Current project direction

ProGameFinds is being migrated from a gaming-gear catalogue to an independent fitness and home-gym equipment research portal.

### Active editorial categories
- Strength equipment
- Cardio equipment
- Home-gym planning
- Fitness accessories
- Gym flooring and storage
- Mobility and recovery accessories

### Editorial standards
- Prioritise exact model identification and primary manufacturer documentation.
- Distinguish manufacturer facts from retailer listing, seller, fulfilment and variant checks.
- Do not publish unsupported prices, stock, ratings, customer reviews or compatibility claims.
- Use age-appropriate safety language; this site is not a medical service or training-plan provider.
- Do not scrape retailer pages or copy protected retailer content.

## Retail-link and affiliate status

**All external product-shopping links are currently disabled.** Distributor and manufacturer shopping links have been removed from active pages. The legacy gaming catalogue register is marked retired.

The site is designed for an Amazon-only affiliate pathway in the future, but it currently displays:
- no Amazon Special Links;
- no Associates tracking ID;
- no Amazon Associate earnings claim;
- no commission or approval claim.

Affiliate functionality must remain disabled until the actual legally eligible account holder independently verifies the Associates account's status, declared site, active approval and assigned Associate ID. Do not use another person's identity or credentials as a workaround, and do not operate an Associates account on behalf of a minor.

Amazon policy links for the actual account holder to review:
- https://affiliate-program.amazon.com/help/operating/agreement/
- https://affiliate-program.amazon.com/help/operating/policies
- https://affiliate-program.amazon.com/help/node/topic/G8TW5AE9XL2VX9VM

The Amazon agreement states that an Associate must be legally able to enter contracts and not be a minor. Special Links must use the Associate ID assigned by Amazon. See the current official documents above.

## Website implementation

- Static HTML/CSS/JavaScript hosted on Cloudflare Pages.
- No external font requests, heavy client framework, checkout or product-purchase flow.
- Local equipment search and category filters.
- Responsive navigation, visible focus styles and reduced-motion support.
- Security response headers remain configured through the Cloudflare Pages headers file.
- Legacy gaming routes redirect to current fitness information pages.
- Product evidence manifest contains no active products until exact model/source verification is complete.
- Contact form is not enabled; the direct support email link is available.

## Validation

GitHub Actions runs:
- node scripts/validate-site.mjs
- node scripts/quality-audit.mjs
- node scripts/audit-product-image-rights.mjs
- Playwright Chromium browser QA for desktop and mobile.

The validators ensure the active portal contains no distributor/manufacturer/Amazon shopping links, no affiliate tags, no stale gaming product content, and no unverified product records.

## Release process

1. Work on a separate feature branch.
2. Run the static validators and browser QA on the Cloudflare Pages preview.
3. Review all changed files and the preview.
4. Merge only when all required checks pass.
5. Confirm Cloudflare production deployment and verify the canonical domain.

Do not mark a product, retailer listing, Associate approval, email delivery or domain ownership as verified without direct evidence.
