# ProGameFinds — Amazon Associates readiness

## Current state
This repository is a static Cloudflare Pages site. The professional compliance branch is `amazon-compliance-professional-setup`; production `main` is intentionally preserved.

## Amazon Associates policy controls implemented in this branch
- The exact program disclosure is retained and paired with a prominent notice that the Associates application is pending and ProGameFinds is not yet approved.
- Every existing Amazon link is expected to use the `progamefinds-20` tracking tag, `rel="sponsored"`, and a nearby `(paid link)` label.
- Product prices, stock status, ratings, testimonials and hands-on testing claims are not fabricated.
- Ten original editorial buying guides have been added. They explain comparison criteria and verification steps; they do not claim hands-on testing or product endorsement.
- SEO canonical, Open Graph metadata, WebSite/Article structured data, robots.txt and sitemap.xml are included.
- GitHub Actions validates affiliate link formatting, disclosures, metadata, guide files and internal anchors.

## Owner actions still required
1. Application status is currently **pending**. Keep the visible pending notice until Amazon confirms acceptance. Do not describe ProGameFinds as an approved Associate before that confirmation.
2. Confirm that `progamefinds-20` is the active tracking ID in the relevant Associates account. This repository cannot inspect private Associates Central reports.
3. Configure a real contact destination and a valid Web3Forms access key. Never commit private credentials or publish placeholder values. The current contact form is deliberately left visibly unconfigured rather than pretending messages are delivered.
4. Verify every ASIN against the exact Amazon listing and manufacturer source; verify current availability/prices at the time of display. Do not publish stale prices or unverified specifications.
5. Complete DNS delegation and custom-domain validation separately. Existing Hostinger email MX/SPF/DKIM/DMARC records must be preserved during any DNS migration.
6. Add/verify the site in Search Console and submit the sitemap after the custom domain resolves correctly.

## Policy notes
Amazon's Operating Agreement requires the exact Associate disclosure and properly tagged Special Links. Amazon's Participation Requirements say Special Links may be displayed after an application is submitted; keep the pending-status notice prominent so the site does not imply acceptance. Link-level disclosures should be clear and conspicuous near the link. Amazon's application review requires at least three qualifying sales within 180 days and checks that submitted sites are public and contain robust original content; Amazon describes 10 posts as a rule of thumb. Personal orders do not qualify. Policy update notes: Amazon's April 14, 2026 policy update adds a 180-day completion requirement for qualifying purchases and expands disqualification to purchases referred through paid or boosted advertising that links to Amazon, subject to stated exceptions. Do not run paid/boosted campaigns directly to Amazon Special Links unless the exact campaign is permitted under the current policy. These site changes cannot guarantee acceptance or qualifying sales.

Official references:
- https://affiliate-program.amazon.com/help/operating/agreement
- https://affiliate-program.amazon.com/help/operating/linking/
- https://affiliate-program.amazon.com/help/operating/participation/
- https://affiliate-program.amazon.com/help/node/topic/G8TW5AE9XL2VX9VM
- https://affiliate-program.amazon.com/help/node/topic/GPXFHVYZMTGPUMPE

## Local validation
Run with Node.js 20+:
```sh
node scripts/validate-site.mjs
```
