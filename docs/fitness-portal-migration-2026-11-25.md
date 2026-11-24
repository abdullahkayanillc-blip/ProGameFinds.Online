# ProGameFinds fitness portal migration — 25 November 2026

## Release scope

The working branch converts the active public site from a gaming-gear catalogue to a fitness and home-gym equipment editorial portal. It preserves the existing repository and original vector artwork while replacing the public product catalogue presentation and the legacy gaming page bodies.

## Applied in this working branch

- New fitness-focused homepage, responsive navigation, category search and filter.
- Six category pages: strength, cardio, home gym, accessories, flooring/storage, mobility/recovery.
- Seven original buying guides covering space planning, equipment selection, flooring, safety, Amazon listing checks and maintenance.
- New About, How We Review, Affiliate Disclosure, Privacy, Terms and Contact pages.
- Legacy gaming category and guide routes redirected to related fitness pages; legacy source files remain as redirect fallback documents.
- Old gaming product evidence register retired and replaced with an empty active-product register.
- New fitness equipment evidence register records six editorial categories and zero product listings.
- Active JavaScript contains only local search/filter behavior; no Amazon, distributor or manufacturer product URL generation.
- Existing CSP, response headers and Cloudflare Pages hosting configuration remain intact.

## Amazon account boundary

The supplied compliance report mentions a notice reference, a possible 26 November 2026 deadline and Store ID assignment. None of those account-specific details was independently verified from Associates Central in this migration. The actual notice's active/resolved status, final deadline, declared-site list, assigned Store ID and any post-deadline monitoring arrangement remain unconfirmed.

The actual Associates account holder must independently review the original notice and current Amazon agreement. No account login, notice response, account modification, tracking-ID creation, or Special Link activation was performed here. The public site displays no active Amazon Special Links and no earnings claim.

The current U.S. Associates Operating Agreement requires an Associate to be legally able to enter contracts and not be a minor. Special Links must use an Associate ID assigned by Amazon. The site's affiliate feature therefore remains disabled until genuine legal eligibility and account approval are independently confirmed by the actual account holder.

## Not yet complete

- Product research and exact model selection for any fitness-equipment candidates.
- Product-specific manufacturer fact verification.
- Amazon listing, seller, fulfilment and variant verification.
- Any Amazon Special Links or program disclosure activation.
- Visual review of the deployed Cloudflare preview and post-merge production-domain browser QA.
- Search Console ownership, sitemap submission, Lighthouse/Core Web Vitals and accessibility audit.
- Secure contact form backend and live inbox delivery confirmation.

## Guardrails

No external product-shopping links, affiliate tags, product prices, stock claims, reviews, ratings, seller promises or unverified product mappings are added. No existing production file is changed directly: this work is isolated on a feature branch and must pass preview QA before merge.
