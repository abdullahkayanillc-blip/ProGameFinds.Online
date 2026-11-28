# ProGameFinds — Gaming Gear Research & Buying Guides

## Current project direction

ProGameFinds is an independent gaming gear research and buying-guide website. Its editorial scope is gaming equipment only.

### Editorial categories
- Gaming mice and keyboards
- Gaming headsets and controllers
- Gaming monitors and displays
- Gaming desks and setup accessories
- Handheld PC accessories
- VR accessories
- Sim-racing equipment
- Streaming and creator peripherals

### Editorial standards
- Prioritise exact model identity and primary manufacturer documentation.
- Distinguish manufacturer specifications from marketplace listing, seller, fulfilment and variant checks.
- Do not publish unsupported prices, stock, ratings, customer reviews or compatibility claims.
- Do not claim hands-on testing unless a test was actually performed and documented.
- Use original commentary, analysis and practical checklists rather than copying retailer or manufacturer prose.
- Do not scrape retailer pages or copy protected retailer content.
- Keep advice age-appropriate and avoid unsafe or restricted product categories.

## Retail-link and affiliate status

**All external product-shopping links are currently disabled.** The historical Amazon product links and tracking tags have been removed from the public catalogue. Product cards and archive entries are research candidates only.

The current public site displays:
- no Amazon Special Links;
- no active Associates tracking ID in the site configuration;
- no Amazon Associate earnings claim or commission disclosure statement;
- no retailer checkout or automatic redirect links;
- no claim that any Associates application or account has been approved.

Do not add commission-generating functionality, tracking IDs or purchase CTAs through this content release. Account eligibility, legal participant requirements and any future monetisation decision are separate from the publication of non-affiliate editorial content.

## Website implementation

- Static HTML, CSS and JavaScript hosted on Cloudflare Pages.
- GitHub source repository: `abdullahkayanillc-blip/ProGameFinds.Online`.
- Cloudflare Pages production branch: `main`.
- Responsive navigation, visible focus styles and reduced-motion support.
- Local search and category filters in the gaming catalogue.
- Security response headers configured in `_headers`.
- Canonical host and legacy-route handling in `_redirects`.
- Public guide library: `/guides.html`.
- Ten original, non-affiliate gaming buying guides under `/guides/`.
- Historical product research archive: `/product-research-archive.html`.
- Product evidence manifest keeps unverified marketplace candidates unverified.
- Contact form is not enabled; a direct support email link is provided.

## Validation and release

The repository includes static validation, professional quality checks, product-image rights checks and desktop/mobile browser QA. The checks cover required pages, SEO metadata, internal links, product evidence state, security headers and the disabled-shopping-link policy.

Release process:
1. Work on a separate feature branch.
2. Confirm the preview deployment and inspect changed pages.
3. Run static validators and browser QA.
4. Review all changed files and the preview.
5. Merge to `main` only after required checks pass.
6. Confirm Cloudflare production deployment and test the canonical domain.

Do not mark a product, retailer listing, Associate approval, email delivery or domain ownership as verified without direct evidence.

## Historical product research archive

- Public archive: `/product-research-archive.html`.
- Structured evidence register: `data/historical-22-product-research.json`.
- The archive preserves 22 historical candidates, including unverified historical ASIN references and category-only placeholders.
- Manufacturer references are context only and do not validate an Amazon ASIN, seller, variant, region or live offer.
- The archive contains no Amazon Special Links, affiliate tracking, retailer product-shopping URLs, prices, ratings, reviews or stock claims.
