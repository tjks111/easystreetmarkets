# Easy Street Markets: Analytics & Sitemap Fix Plan

## Summary
The user identified two issues on `easystreetmarkets.com`:
1. **Analytics Tags:** Google Analytics tags appear "missing" during navigation.
2. **Sitemaps:** Google Search Console shows "No referring sitemaps detected" for URLs like `https://easystreetmarkets.com/art-prints`.

## Root Cause Analysis
1. **Analytics:** The `layout.tsx` file uses manual `<Script>` tags. In Next.js 15, these manual tags do not reliably trigger pageview events during soft client-side navigations (clicking internal links), making it appear as though the tag is missing on subsequent pages.
2. **Sitemaps (Trailing Slash Mismatch):** By default, Next.js strips trailing slashes. The canonical tags on the site (e.g., `https://easystreetmarkets.com/art-prints`) correctly do not have trailing slashes. **However, `src/app/sitemap.ts` is hardcoded to generate URLs WITH trailing slashes** (e.g., `url: \`\${SITE_URL}/\${c.slug}/\``). 
   - Googlebot sees the slash version in the sitemap, visits it, and hits a 308 redirect to the no-slash version.
   - Because the no-slash version isn't actually in the XML file, GSC's inspection tool reports "No referring sitemaps detected" for the final, indexed URL.

---

## Proposed Changes

### Phase 1: Fix Analytics (Client-Side Tracking)
1. **Install `@next/third-parties`**
   - Run `npm install @next/third-parties` in the `easystreetmarkets` directory.
2. **Refactor `layout.tsx`**
   - **File**: `c:\Users\rento\easystreetmarkets\src\app\layout.tsx`
   - **What**: Replace the manual `<Script>` block with the official `<GoogleAnalytics gaId="G-Z75TJXZVK3" />` component. This automatically hooks into the Next.js router to fire pageviews on every click.

### Phase 2: Fix Sitemap Trailing Slashes
1. **Refactor `sitemap.ts`**
   - **File**: `c:\Users\rento\easystreetmarkets\src\app\sitemap.ts`
   - **What**: Remove all hardcoded trailing slashes from the generated URLs to match the site's canonical tags and Next.js default behavior.
   - **How**: 
     - Change ``${SITE_URL}/animals/`` to ``${SITE_URL}/animals``
     - Change ``${SITE_URL}/${c.slug}/`` to ``${SITE_URL}/${c.slug}``
     - (The root URL ``${SITE_URL}/`` will remain as-is since the root inherently has a slash).

## Verification
- **Sitemap Output**: Run a local build or curl the local `/sitemap.xml` to ensure URLs are generated as `https://easystreetmarkets.com/art-prints` instead of `.../art-prints/`.
- **Analytics Build**: Ensure the Next.js 15 build succeeds with the new third-parties package.