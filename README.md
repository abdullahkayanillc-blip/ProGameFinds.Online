# ProGameFinds — professional upgrade (preview branch)

## Working branch
`progamefinds-professional-upgrade-2026-11-19` is an isolated working branch based on `amazon-compliance-professional-setup`.

Production `main` is unchanged. This branch is not merged or published to the production domain.

## Experience changes prepared
- Premium responsive gaming-gear design with original vector illustration and local brand/social assets.
- Local CSS and JavaScript assets; removed external Google Fonts dependency.
- Accessible catalogue search and category filters; keyboard shortcut `/` focuses search and Escape clears it.
- Clear owner-review notice around supplied product listings: verify ASIN/model mapping, seller, compatibility and current retailer details before purchase.
- Preserved the 22 existing Amazon outbound links and the visible `(paid link)` disclosure, `rel=sponsored`, `noopener` and the current source tag. Tag ownership/activation is not verifiable from this repository.
- Retained all 10 original editorial buying guides.
- Added dedicated About, Affiliate Disclosure, Privacy and Terms pages.
- Added sitemap entries, metadata and a vector social-preview image.
- Added Cloudflare Pages response security headers and a Node-only site validator.
- Disabled contact form controls until a real inbox and delivery provider are selected, configured and successfully tested.

## Amazon Associates controls
The page must accurately describe the actual Associates Central application status. Current source content has a pending-application notice and the required exact disclosure statement. Do not say the account is approved unless Amazon confirms acceptance. Do not create clicks, sessions, orders, ratings or reviews artificially. Do not display prices, stock or Amazon reviews/ratings without permitted Amazon data access. Do not use Amazon Program Content or Special Links in model-training or machine-learning workflows without Amazon's prior written permission.

Official references:
- https://affiliate-program.amazon.com/help/operating/policies
- https://affiliate-program.amazon.com/help/operating/participation/
- https://affiliate-program.amazon.com/help/node/topic/G8TW5AE9XL2VX9VM
- https://affiliate-program.amazon.com/help/node/topic/GPXFHVYZMTGPUMPE

## Validation
GitHub Actions runs `node scripts/validate-site.mjs`. The validator does not fetch Amazon pages or verify product identity; it checks source-level affiliate formatting, disclosures, SEO assets, page inventory, sitemap, robots and security headers.

## Owner-only activation checklist
1. Check Associates Central and confirm the exact account status and tracking ID.
2. Verify the 20 ASIN mappings and model descriptions using manufacturer sources and the live listings; do not scrape Amazon.
3. Select and confirm the contact inbox and delivery provider, then configure its secret securely and test real delivery/failure handling.
4. Confirm Cloudflare zone activation, root/www Pages custom domains, HTTPS certificate and redirects.
5. Complete Search Console ownership verification and submit the sitemap.
6. Review the preview on desktop and mobile; request any final changes.
7. Only after explicit approval, merge the PR and publish production.

## Privacy and analytics
No analytics or ad-pixel code has been added. Cloudflare Web Analytics and Google Search Console have not been connected because they require account-level owner verification/configuration. The privacy policy describes the current inactive contact form and must be updated before any new data-collection service is enabled.


## Preview build
The professional upgrade branch is allowlisted for Cloudflare Pages preview builds. Its preview build is isolated from production; the production branch remains `main`.
