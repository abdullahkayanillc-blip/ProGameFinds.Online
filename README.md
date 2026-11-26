# ProGameFinds — Gaming Gear Research

ProGameFinds is an independent editorial website for gaming peripherals, handheld gaming accessories, VR add-ons, sim-racing equipment, streaming tools and gaming-space setup information.

## Current public-site scope

- Gaming gear discovery catalogue with clearly labelled research candidates.
- GameSir G7 Pro model research page and support FAQ.
- Historical 22-record product research archive.
- Buying guides, compatibility checks and product-listing verification guidance.
- About, research-method, retail-link status, privacy, terms and contact pages.
- Responsive static HTML/CSS/JavaScript site hosted on Cloudflare Pages.

The active public homepage and catalogue are gaming-focused. Older fitness-portal migration notes and fitness-specific legacy files are historical repository artifacts, not the current editorial scope. Do not treat those legacy files as active public catalogue pages.

## Editorial and evidence standards

- Identify exact manufacturer, model, generation, revision, region and SKU where evidence supports it.
- Separate manufacturer specifications from retailer listing, seller, fulfilment, variant and availability checks.
- Do not infer an Amazon ASIN-to-model match from a similar product name or image.
- Do not invent prices, discounts, stock, ratings, review counts, hands-on testing or customer experiences.
- Clearly label original vector artwork as illustration, not product photography.
- Use manufacturer photography or creator content only when the specific asset's usage rights are documented.
- Publish corrections transparently and retain source dates for volatile information.

## Current retail-link and affiliate state

**The public site currently publishes no Amazon Special Links, affiliate tracking links or retailer product-shopping links.**

- No Associate Tracking ID is active in the public site.
- No commission or earnings claim is made.
- Historical ASINs in the research archive remain unverified research references.
- The GameSir G7 Pro supplied ASIN is also an unverified reference, not a confirmed live product listing.
- Do not add affiliate links, tracking identifiers or account-status claims as part of ordinary editorial changes.

Amazon Associates participation is subject to Amazon's current agreement and eligibility requirements. Any programme account must be managed independently by a legally eligible account holder. No age or identity restriction may be bypassed.

## Privacy and contact implementation

- Static Cloudflare Pages hosting.
- No on-site checkout, user account, customer profile database or product-order workflow.
- Local catalogue search and filters run in the visitor's browser.
- Direct email contact is available through the published support address.
- The website contact form is not enabled; no form submission is collected.
- Do not claim analytics, cookies, consent management or email delivery are enabled unless separately configured and tested.

## Technical quality gates

GitHub Actions validates:
- Required public pages and local references.
- HTML metadata, duplicate IDs, image alt text and asset dimensions.
- Product evidence and image-rights records.
- Absence of retailer shopping links and affiliate tracking while disabled.
- Desktop and mobile Chromium browser behavior.

A successful CI run proves only the checks executed by that workflow. It does not independently prove Amazon account approval, product listing accuracy, legal compliance, Search Console ownership, real-world performance metrics or successful email delivery.

## Release process

1. Work on an isolated feature branch.
2. Preserve existing files and user content; make additive, scoped changes.
3. Run static validation, quality audit, image-rights audit and desktop/mobile browser QA.
4. Review the complete diff and deployed preview.
5. Obtain explicit approval before merging or deploying production.
6. Verify the canonical production domain and key routes after an approved release.

## Historical research archive

- Public archive: `/product-research-archive.html`
- Structured evidence register: `data/historical-22-product-research.json`
- 22 historical product candidates are retained.
- 20 ASIN candidates are recorded, with zero verified ASIN-to-model mappings in the archive snapshot.
- Two records are category-only ideas without ASINs.
- Manufacturer references provide model-family context only; they do not prove an Amazon listing, seller, variant, region or live offer.
- No prices, ratings, reviews, stock or commission estimates are published in the archive.

## Cost and service boundaries

Cloudflare Pages and GitHub Actions may have free-tier quotas and limits. Check the current account plan and usage before relying on capacity. Do not add paid services, paid APIs or external browser wallets without explicit owner approval.
