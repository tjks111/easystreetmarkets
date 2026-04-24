# Remove Affiliate Meta-Content Spec

## Why
The current procedural editorial text generated on category and animal intersection pages breaks the "enthusiast-peer" voice by explicitly exposing the business model. It mentions "affiliate-capable stores," Amazon, Etsy, Printful, and explains that "this page is a filter" for affiliate products. This makes the content feel like a marketer wrote it rather than a fellow wildlife enthusiast. The user wants the copy to focus strictly on the animals, the conservation aspects, and the quality of the products, without breaking the fourth wall.

Additionally, during the initial testing phase of the headless POD architecture, a few mock Printful products were inserted into the database. These need to be cleaned up so only the live, properly configured Stripe POD products remain.

## What Changes
- **Generate 300 Earth Day POD Products**:
  - Rewire `headless_pod.py` to support background removal. DALL-E 3 cannot generate true transparent PNGs natively, so the script will need to generate the image, download it locally, process it with a background removal library (like `rembg`), and then upload the transparent PNG to Printful.
  - Generate 300 Earth Day focused products, split evenly across the top 10 performing animals/queries (30 products per animal).
  - Execute this generation script first before tackling the editorial changes.
- **Rewrite `src/lib/guide-content.ts`**:
  - Remove references to "affiliate-capable stores" and specific marketplace names (Amazon, Etsy, Printful-own, etc.) from `intro`, `whyMatters`, and `faqs`.
  - Reframe the text to focus on the curation of high-quality merchandise and the beauty/significance of the animal.
  - Remove the FAQ question explicitly explaining the affiliate commission model if it breaks the fourth wall too aggressively, or soften it so it's less prominent in the core narrative.
- **Update Product Sorting**:
  - Modify the product fetching/sorting logic (likely in `src/lib/supabase-client.ts` or page-level components) to ensure that Easy Street Markets' own products (`is_own_product: true` or `source: 'printful-own'`) are always sorted to the top of the grid on all category, animal, and intersection pages.
- **Database Cleanup**:
  - Delete the 3 old mock POD products (`pod-sea-turtle-price_1mock123`, `pod-wolf-price_1mock456`, `pod-beagle-price_1mock789`) from the `products` table.
- **Cache & Count Sync**:
  - Run `update_counts.py` to synchronize product counts after the database deletion.
  - Run `.\deploy.ps1` to rebuild the static pages with the new counts and new editorial text.

## Impact
- Affected code: `src/lib/guide-content.ts`
- Affected data: Supabase `products` table, `animals` table (counts), `categories` table (counts).
- Affected UI: Intersection page (`/[category]/[animal]`) introductory text and FAQs.

## MODIFIED Requirements
### Requirement: Editorial Text Generation
The `generateIntersectionEditorial` function SHALL generate text that evaluates the product quality and celebrates the animal without explicitly mentioning the site's affiliate aggregation strategy or specific marketplace platform names (unless contextually necessary for product quality, e.g., "handmade platforms").

## REMOVED Requirements
### Requirement: Mock POD Products
**Reason**: Mock products from early architecture tests clutter the live site.
**Migration**: Delete rows from Supabase where `slug` contains `mock`.