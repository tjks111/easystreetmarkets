# Tasks

## Phase 1: Immersive Modal (UI)
- [x] Task 1: Update Database Schema.
  - [x] SubTask 1.1: Add a `variants` JSONB column to the `products` table in Supabase.
- [x] Task 2: Create `PodProductModal.tsx` Client Component.
  - [x] SubTask 2.1: Design a Lemon Squeezy-style pop-out modal (frosted glass backdrop, rounded corners, flex layout).
  - [x] SubTask 2.2: Add stateful selectors for Size (S, M, L, XL, 2XL) and Color (Black, White, Navy) using Tailwind buttons/swatches.
  - [x] SubTask 2.3: Dynamically update the modal's main product image to match the `image_url` of the currently selected Color variant.
  - [x] SubTask 2.4: Wire the "Add to Cart" button inside the modal to `useShoppingCart` with the selected size/color as `sku` modifiers (e.g., `id-size-color`) or `product_data`.
  - [x] SubTask 2.5: Close modal on outside click or 'X' button.
- [x] Task 3: Create `PodCardInteractive.tsx` Client Component wrapper.
  - [x] SubTask 3.1: Implement an `onClick` handler on the wrapper that opens the `PodProductModal`.
  - [x] SubTask 3.2: Refactor `ProductCard.tsx` to conditionally wrap POD products in `PodCardInteractive` instead of an `<a>` tag, passing the product data to the modal.
  - [x] SubTask 3.3: Remove `AddToCartButton.tsx` and replace it with a static "Select Options" or visual button inside `ProductCard`.

## Phase 2: Multi-Color Image SEO & Supabase Hosting
- [x] Task 4: Create `scripts/migrate_mockups_to_supabase.py` backfill script.
  - [x] SubTask 4.1: Fetch all existing POD products.
  - [x] SubTask 4.2: Use the Printful API to generate mockups for multiple color variants (e.g., Black, White, Navy).
  - [x] SubTask 4.3: Download the image bytes, rename the files using `{slug}-{color}.png`.
  - [x] SubTask 4.4: Upload to the Supabase `product-images` bucket and update the row with the new `variants` JSON array.
- [x] Task 5: Update `headless_pod.py` generation engine.
  - [x] SubTask 5.1: Modify the script to request mockups for multiple color variants from Printful.
  - [x] SubTask 5.2: Download, rename (`{slug}-{color}.png`), and upload *all* color mockups to Supabase before inserting the `variants` array into the database.
- [x] Task 6: Create `src/app/image-sitemap.xml/route.ts`.
  - [x] SubTask 6.1: Query all products with `variants` or `image_url` from Supabase.
  - [x] SubTask 6.2: Generate an XML Image Sitemap adhering to Google's `<image:image>` schema, mapping every color variant image to its category page URL (`/[category]`).

# Task Dependencies
- Task 2 depends on Task 1.
- Task 3 depends on Task 2.
- Task 4 depends on Task 1.
- Task 5 depends on Task 4.
- Task 6 depends on Task 5.
