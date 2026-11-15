# ProGameFinds.Online — Preview redesign

This branch contains an isolated editorial and visual redesign proposal for ProGameFinds. The production branch remains `main`.

## Preview scope
- Responsive gaming gear landing page with an original vector brand mark.
- Original buyer education articles under `/blog/`.
- About, affiliate disclosure, privacy, and terms pages.
- SEO metadata, sitemap, and robots.txt.
- Static quality gate: `node scripts/verify-site.mjs`.

## Editorial and affiliate guardrails
- The site does not claim hands-on testing unless an article documents it.
- Do not publish unverified prices, availability, star ratings, sales ranks, or performance claims.
- Amazon product images and videos are not scraped. Use Amazon-approved program content only where the applicable licence permits it, or obtain written/licensed media rights.
- Each Amazon Special Link must retain the Associates tag and a clear paid-link disclosure.
- Confirm the live Amazon product page and exact variant manually before launch.

## Deployment
Cloudflare Pages production branch: `main`.
This branch is preview-only and is not a production release.
