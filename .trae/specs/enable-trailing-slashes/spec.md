# Enable Trailing Slashes Spec

## Why
Google Search Console is reporting a spike in "Moved permanently (301)" errors. This is caused by a conflict where internal `<Link>` components and `<link rel="canonical">` tags hardcode trailing slashes, but Next.js defaults to stripping them (`trailingSlash: false`). This mismatch causes crawlers to experience an infinite redirect loop. 

## What Changes
- Set `trailingSlash: true` in the Next.js configuration (`next.config.ts`).
- Update the sitemap generator (`src/app/sitemap.ts`) to ensure all generated URLs (static and dynamic) end with a trailing slash to match the new configuration and canonical tags.

## Impact
- Affected specs: SEO canonical consistency, internal routing.
- Affected code: `next.config.ts`, `src/app/sitemap.ts`.

## MODIFIED Requirements
### Requirement: Next.js Routing
The system SHALL append trailing slashes to all URLs natively, aligning with the existing hardcoded internal links and canonical metadata.

### Requirement: Sitemap Generation
The `sitemap.xml` SHALL output all URLs with a trailing slash to prevent crawlers from hitting 308 redirects upon crawling the sitemap.
