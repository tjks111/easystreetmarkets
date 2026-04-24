# Immersive POD Modal & Image SEO Spec

## Why
1. **User Experience (Phase 1)**: Instead of instantly adding to the cart, clicking an Easy Street (POD) product should open an immersive, Lemon Squeezy-style pop-out modal. This allows users to view the product in detail, select their preferred size and color, and see the product image dynamically update to match the selected color before purchasing.
2. **SEO Optimization (Phase 2)**: Product images are currently hosted on Printful's CDN with non-descriptive hashes. For maximum Google Images visibility, mockups for *all* colors must be generated, downloaded, renamed with SEO-friendly keywords (e.g., `earth-day-sea-turtle-t-shirt-black.png`), hosted on Supabase, and submitted via a dedicated Image Sitemap.

## What Changes
### Phase 1: Immersive Modal & Dynamic Images
- **Database Update**: Add a `variants` (JSONB) column to the `products` table in Supabase to store color-specific image URLs.
- **Client Components**: Create a `PodProductModal.tsx` featuring a frosted glass backdrop (`backdrop-blur-sm`), a clean two-column layout, and smooth entry animations.
- **Dynamic Image Switching**: Implement stateful selectors for **Color** (Black, White, Navy). When a color is selected, the modal's main product image dynamically switches to the corresponding mockup URL.
- **Size Selection**: Add stateful selectors for **Size** (S, M, L, XL, 2XL).
- **Interactive Card**: Create a `PodCardInteractive.tsx` wrapper to replace the `<a>` tag for POD products. Clicking the card opens the modal instead of navigating.

### Phase 2: Multi-Color Image SEO Pipeline
- **Generation Engine Update**: Update `headless_pod.py` to request mockups for multiple color variants (e.g., Black, White, Navy) from Printful. Download *all* color mockups, rename them for SEO (`{slug}-{color}.png`), upload to the Supabase `product-images` bucket, and save the mapping in the new `variants` JSONB column.
- **Backfill Script**: Create `scripts/migrate_mockups_to_supabase.py` to retroactively generate missing color mockups for existing POD products, upload them to Supabase, and populate the `variants` column.
- **Image Sitemap**: Add an `image-sitemap.xml/route.ts` endpoint that outputs a Google-compliant XML Image Sitemap, linking *all* color variant Supabase image URLs to their respective category pages.

## Impact
- Affected UI: Product Cards, Modal (Dynamic images based on color state).
- Affected DB: New `variants` JSONB column in `products`.
- Affected Data: `image_url` transitions to Supabase, with full multi-color variant support.
- Affected SEO: Massive boost in Google Images indexing via multi-color Image Sitemap.

## ADDED Requirements
### Requirement: Dynamic Color Switching
The modal SHALL dynamically update the main product image to reflect the user's selected color variant.

### Requirement: Immersive Product Selection
The system SHALL present a modal when a POD product is clicked, preventing default navigation and requiring the user to select a Size and Color before adding to the cart.

### Requirement: SEO-Friendly Image Hosting
All color variant product images SHALL be hosted on the first-party Supabase bucket with descriptive, hyphenated filenames derived from the product name/slug and color, and exposed to crawlers via an Image Sitemap.
