# ProGameFinds operations and release runbook

This runbook applies to the isolated preview branch and future production releases. It does not authorize a merge, production deploy, account connection, or paid service.

## Current deployment boundaries

- Production branch: `main`.
- Professional redesign preview: `progamefinds-professional-upgrade-2026-11-19`.
- QA extension branch: `progamefinds-professional-qa-2026-11-19`.
- QA extension PR: #3, targeting the professional preview branch.
- Keep all changes additive. Preserve existing product guides and user content. Retailer shopping links and affiliate tracking tags are currently disabled and must not be reintroduced without a separate review.

## Quality gates

Run locally with Node.js 20 or later:

```sh
node scripts/validate-site.mjs
node scripts/quality-audit.mjs
```

The first validator checks that retailer shopping links and affiliate tracking remain disabled, alongside required pages, sitemap, robots file and security headers. The second checks HTML metadata, duplicate IDs, local references, image alt text and dimensions, required assets, product-evidence manifest integrity, and raw CSS/JS size budgets.

A passing static audit is not a substitute for browser testing, accessibility testing with assistive technology, or a real-world performance measurement.

## Product verification workflow

For every gaming product:

1. Record the exact manufacturer, model, revision, region and official manufacturer source.
2. Check the retailer listing separately. Record ASIN-to-model mapping, seller, variant and current listing status independently.
3. Do not infer an ASIN match from a similar product name or image.
4. Do not publish prices, stock, star ratings or review counts unless the applicable retailer/program data terms permit the exact data source and refresh method.
5. Record the date and source for every fact. Recheck volatile facts before publication.
6. Use the label "Manufacturer specifications checked" only when the manufacturer evidence is recorded. Do not imply hands-on testing unless a documented test was actually performed.

The manifest at `data/product-verification.json` is the source of truth for verification state. Unknown values must remain unknown, not be guessed.

## Image and UGC rights workflow

- Manufacturer product photography: publish only after the specific asset's licence or written permission is confirmed for this use, territory and channel.
- Creator UGC: retain the original creator identity, written usage permission, permitted channels, territory, duration, editing rights and disclosure requirements. A public social post is not automatically a licence.
- Original AI/editorial artwork: label as illustrative. Never present it as a real product photograph, creator UGC, customer review, hands-on test or endorsement.
- Store source, creator/rights holder, permission evidence reference, allowed usage and expiry/review date in an image-rights register before publication.
- If rights are missing, use neutral category artwork or no image. Do not scrape retailer/manufacturer images.

## Performance and browser QA

Before release, test the preview at mobile and desktop widths:

- Page loads over HTTPS; no broken navigation or local assets.
- Search and each category filter work with keyboard and touch.
- Product cards must not expose retailer shopping CTAs while the affiliate feature is disabled.
- No accidental form submission, purchase, login, or data collection during QA.
- No console errors, failed requests, horizontal overflow, missing image alt text, or layout shifts caused by un-sized images.
- Measure Lighthouse/PageSpeed metrics (LCP, INP, CLS, TBT, accessibility and best practices) on the deployed preview. Save the report and test date; do not claim "ultra-fast" without measured results.
- Check image payload sizes, responsive variants, compression, lazy loading below the fold and cache headers.
- A GitHub Actions Playwright Chromium smoke test runs on the isolated preview branch without an external browser wallet. GitHub Actions and hosted runners have account quotas/limits, so confirm current plan limits. TinyFish browser automation is a separate metered service and is not required for this workflow. Use local browser DevTools or Lighthouse CLI as additional zero-cost checks.

## Affiliate and legal readiness

- Current site state: all retailer shopping links are removed, and no Associate Tracking ID is active in the public site manifest.
- Do not imply the site earns commissions or is actively using Special Links.
- Any future reactivation requires a separate owner review, verified programme eligibility, policy-compliant links and clear disclosures.
- Recheck the current Amazon Operating Agreement, Program Policies and permitted data/image usage before adding any feature.
- Privacy and terms pages must reflect the actual services, cookies, analytics, forms and data retention that are enabled at release time.

## Contact, analytics and search

- Direct email contact is available through `mailto:support@progamefinds.online`; the mailbox is present in the connected Hostinger account. The on-page form remains disabled until a server-side delivery provider is configured and success/failure handling is tested. Do not send test messages without explicit owner authorization.
- Do not place credentials in source files, Git history, screenshots or chat.
- Enable analytics only after the owner chooses the provider and the privacy notice is updated. Prefer privacy-conscious, minimal collection.
- Verify domain ownership in Search Console from the owner account, then submit the sitemap and inspect indexing/canonical selection.
- Confirm root and www DNS, HTTPS certificate, redirects and canonical URL before production.

## Release and rollback

1. Review the draft PR diff and CI checks.
2. Verify the preview visually on mobile and desktop.
3. Complete the owner-only checks above and attach evidence.
4. Obtain explicit owner approval before merging or deploying production.
5. After release, smoke-test the canonical domain and key internal navigation destinations; confirm no retailer shopping links were reintroduced.
6. If a regression occurs, revert the specific release commit or restore the last known-good deployment. Do not rewrite or delete unrelated history.

## Cost labels

- GitHub Actions and Cloudflare Pages may have free-tier quotas and usage limits; confirm current account limits before relying on them.
- Node.js static validation and local Lighthouse/DevTools workflows can be run at $0.
- External browser automation, licensed UGC, paid image libraries, email delivery services and custom domains may incur costs or require owner accounts/permissions. They are not represented as free forever.


## Preview branch deployment

Cloudflare Pages preview deployments are enabled for all non-production branches. QA browser tests must target the current deployment URL for this exact commit, never a stale preview URL. Production remains pinned to `main` until the approved release PR is merged.
