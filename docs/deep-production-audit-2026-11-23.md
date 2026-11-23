# ProGameFinds — Deep production and product-evidence audit

**Audit date:** 2026-11-23  
**Production URL:** https://progamefinds.online/  
**Production commit audited:** `edf5a8285b8e6fa938f59dc559e74ea1151b6dc6`  
**Scope:** Read-only live browser audit, repository/source inspection, catalogue evidence review, and release-readiness assessment.

## Executive result

The public site is live and its main navigation, editorial pages, internal links, image assets and catalogue search passed the browser checks below. The product catalogue is **not ready to be described as fully verified**: the register contains 22 candidates, 18 with recorded manufacturer source pages, and none of the 20 candidate ASINs has a verified ASIN-to-model mapping. A manufacturer source page is not proof that a retailer ASIN matches the exact model or variant.

The site currently uses ordinary Amazon search links generated dynamically by `assets/site.js`. They are not direct ASIN links, do not carry an Associates tracking ID, and do not earn commissions.

## Live browser checks

| Check | Result |
|---|---:|
| Pages visited | 14 |
| Internal links tested | 23 |
| Broken internal links reported | 0 |
| Broken images reported | 0 |
| Browser runtime/console errors reported | 0 |
| Product cards in catalogue | 22 |
| Search test | “Logitech G305” returned one matching candidate |

Pages visited: homepage, six dedicated category pages, Collections, Guides, Support, Affiliate Disclosure, About, Privacy and Terms.

The browser agent's summary said no product outbound links were visible on the cards. Repository source inspection resolves this discrepancy: `assets/site.js` creates a `Search Amazon listings` link for every product card using `https://www.amazon.com/s?k=` plus the encoded product name. The cards do not link to a specific ASIN product page. The G305 alone also has a manufacturer details link.

## Product evidence status

**Evidence-register updates:** commit `df8ec3e887d6ecc820ed4e569fa7317b2e89106b` recorded 17 manufacturer source pages. A later Govee evidence update (`4a87c78339e01fe7fb100e233da4e7482fba2124`) added the official Govee H617A specifications reference, bringing the current register to 18 source pages. These updates do not change the zero verified ASIN-to-model mappings.

| Evidence item | Count |
|---|---:|
| Catalogue entries | 22 |
| Candidate ASINs recorded | 20 |
| Manufacturer source page recorded | 18 |
| Entries without a manufacturer source page | 4 (2 branded ASIN candidates + 2 category-only entries) |
| Category-level entries without ASIN (chairs, desks) | 2 |
| ASIN-to-model mappings verified | 0 |

- 18 entries now have manufacturer source pages recorded in the evidence register.
- Govee H617A now has an official Govee specifications reference. A secondary catalogue source associates candidate ASIN B0991Q94KP with H617A, but the exact Amazon US detail page, seller and selected variant remain unverified.
- Two ASIN-bearing candidates still have no recorded manufacturer source: HBOWMDJIA LED Lights 200 ft and Leeleberd LED Lights 100 ft.
- Logitech G305 LIGHTSPEED is the only entry with manufacturer facts populated; the other source pages are recorded as evidence references, not as complete specification verification.
- All 20 candidate ASIN-to-model mappings, live listing states, seller identities and variants remain unverified.
- The second HyperX Cloud III entry is a possible duplicate. It is retained as a candidate but must not be represented as a confirmed variant.
- The chairs and desks entries are category-level ideas, not exact product models.
- All published product visuals remain original category illustrations, not exact product photography or customer UGC.
- No prices, stock, review counts or ratings are claimed.

An attempted direct Amazon page inspection of the 20 candidate ASINs timed out before completion. Therefore no ASIN-to-model mapping has been promoted to verified. Seller, live listing, variant, regional version and compatibility checks remain outstanding.

## Browser QA discrepancy — release gate

The two failed assertions in run `45141088461` were from before the later selector correction in commit `42f6fc494aafea875626b88b5f599c79eab8fe66`. The diagnostic-only PR [#19](https://github.com/abdullahkayanillc-blip/ProGameFinds.Online/pull/19) was closed as obsolete. Subsequent preview run [45183075569](https://github.com/abdullahkayanillc-blip/ProGameFinds.Online/actions/runs/45183075569) passed the 22-link, one-link-per-card, and post-filter visibility checks, along with the rest of the Chromium suite.

## SEO and technical source review

Repository inspection confirms explicit HTML title, meta description and canonical URL elements on all 14 visited top-level pages. This is more precise than the browser agent's preliminary note that metadata might be inconsistent.

The current repository includes:
- `robots.txt` and `sitemap.xml`;
- Cloudflare Pages `_headers` security-header rules;
- a static compliance validator;
- a professional HTML/local-reference/evidence-register quality audit;
- a product-image-rights audit.

The recorded Chromium workflow run [45141088461](https://github.com/abdullahkayanillc-blip/ProGameFinds.Online/actions/runs/45141088461) **failed two retailer-link assertions**: the initial count of 22 Amazon search links and the count after clearing filters. Other logged checks passed, including the 22 catalogue cards, search, category filter, artwork, internal pages, desktop/mobile overflow and runtime-error checks. A separate live-browser audit previously reported 22 cards and 22 retailer links. This historical failure is superseded by the later passing preview run; a fresh post-merge production-domain browser run remains a separate verification item.

## Affiliate and operational readiness

| Area | Status |
|---|---|
| Amazon Associates approval | Not confirmed |
| Associates tracking ID in product links | No |
| Commission-earning links | No |
| Direct product ASIN links | No |
| Product image permissions for manufacturer photography | Not confirmed |
| Contact form | Disabled; secure delivery backend not configured/tested |
| Direct support email delivery | Not verified in this audit |
| Search Console ownership | Not confirmed |
| Lighthouse / Core Web Vitals measurements | Not captured in this audit |

Affiliate activation is intentionally not enabled. Do not add tracking IDs, commission claims or the required Associate statement until the account's legal eligibility and final program approval are confirmed by the account holder. No age or identity restriction should be bypassed.

## Release recommendation

**Keep the existing production site live in its current transparent, non-affiliate state.** Do not convert candidate ASINs into direct product links or mark them verified until each exact product detail page, seller, variant and manufacturer model are independently checked.

Next technical gates:
1. Complete exact model and manufacturer source checks for the 19 unchecked ASIN-bearing entries.
2. Complete live retailer ASIN, seller, variant and regional listing verification for all 20 candidates.
3. Resolve the possible duplicate HyperX Cloud III entry.
4. Capture Lighthouse/Core Web Vitals and accessibility test evidence.
5. Verify support mailbox delivery and Search Console ownership from the authorized owner account.
6. Re-run all automated and browser checks after any catalogue changes.

**No unsupported product claim, affiliate activation, tracking link, price, stock or review data was added in this audit.**
