# Implement Category Pagination Spec

## Why
Currently, the category pages (e.g., `/art-prints/`) cap products at 100 to keep Cloudflare Worker CPU usage low, but users cannot view the rest of the items. The current pagination implementation uses URL query parameters (`?page=2`), which opts Next.js into dynamic rendering on the server, causing potential CPU spikes on cold starts. Furthermore, query-based pagination can create infinite faceted navigation traps for Googlebot if not strictly constrained. We need a lightweight, path-based, statically-generated pagination system that preserves the Hub-and-Spoke architecture without sacrificing SEO.

## What Changes
- Implement a new path-based dynamic route for paginated category hubs: `src/app/[category]/page/[page]/page.tsx`.
- Refactor the existing `src/app/[category]/page.tsx` to remove dynamic `searchParams` usage, ensuring the base page is 100% statically generated (SSG).
- Extract shared logic (fetching category, products, FAQs) into a helper to be used by both the base category route and the paginated route.
- Implement robust out-of-bounds protection (return `notFound()` if `page > totalPages` or `page < 2`).
- Set `<meta name="robots" content="noindex, follow">` on all paginated pages (`page >= 2`) to conserve Googlebot's crawl budget for intersection pages (Hub-and-Spoke spokes) and prevent duplicate content bloat, while still allowing link discovery.
- Update internal pagination links (`Next` and `Previous`) to use the new path format (e.g., `/[category]/page/2/`).

## Impact
- Affected specs: Category Hub Pages, SEO Crawl Budget, Cloudflare Worker CPU Limits.
- Affected code:
  - `src/app/[category]/page.tsx`
  - `src/app/[category]/page/[page]/page.tsx` (New)

## ADDED Requirements
### Requirement: Path-Based Pagination
The system SHALL provide access to products beyond the 100-item cap via path-based pagination (`/[category]/page/[page]/`).

#### Scenario: Success case
- **WHEN** user navigates to `/[category]/page/2/`
- **THEN** the system displays items 101-200 of the category and includes proper `canonical` and `noindex, follow` tags.

## MODIFIED Requirements
### Requirement: Category Hub Base Route
The `src/app/[category]/page.tsx` route must be strictly static (no `searchParams` parsing) to ensure 0ms cold-start CPU overhead.

## REMOVED Requirements
### Requirement: Query-Based Pagination
**Reason**: Query-based pagination (`?page=X`) forces dynamic server-rendering and can create infinite crawl traps.
**Migration**: Existing UI components will link to the new path-based routes. Any existing `?page=` queries will either 404 or just render the base page without parameters (handled naturally by Next.js stripping unused query params in static pages).