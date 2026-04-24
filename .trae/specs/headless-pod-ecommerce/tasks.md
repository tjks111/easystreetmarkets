# Headless AI Print-on-Demand E-Commerce Implementation Tasks

## Phase 1: Database & Dependencies Setup
- [x] Add `stripe_price_id` and `printful_variant_id` columns to the `products` table in Supabase.
- [x] Add a `product_type` column to the `products` table with an enum or string constraint (e.g., 'affiliate', 'pod').
- [x] Create a new `orders` table in Supabase to store customer emails, shipping addresses, and order metadata for future CRM capabilities.
- [x] Update `insert_supabase.py` to handle the new columns when inserting POD products.
- [x] Install the `@stripe/stripe-js` and `stripe` Node packages in the Next.js project.
- [x] Install a client-side shopping cart library (e.g., `use-shopping-cart` or Zustand) in the Next.js project.

## Phase 2: The "Chat-to-Store" CLI Engine
- [x] Create `scripts/headless_pod.py` to handle the AI generation and Printful integration.
- [x] Implement the OpenAI DALL-E 3 API call in `headless_pod.py` to generate transparent PNG designs based on prompts.
- [x] Implement the Printful API `POST /files` endpoint to upload the generated artwork.
- [x] Implement the Printful API `POST /mockup-generator/create-task` endpoint to generate high-quality product mockups (e.g., T-Shirts, Mugs).
- [x] Implement the Stripe API integration in `headless_pod.py` to register a `Product` and `Price` object.
- [x] Connect the outputs (Mockup URL, Stripe Price ID, Printful Sync Variant ID) to `insert_supabase.py` for direct database insertion.

## Phase 3: The Native Next.js Shopping Cart
- [x] Build a `CartProvider` to manage global state for the client-side shopping cart (items, quantities, totals).
- [x] Modify the `ProductCard` component to render an "Add to Cart" button if `product_type === 'pod'` (otherwise, default to the existing Amazon affiliate link).
- [x] Build a `/cart` page or `CartDrawer` component to display selected items and a "Checkout" button.
- [x] Create a Next.js Server Action (`createCheckoutSession`) that takes the cart items and securely generates a dynamic Stripe Checkout Session.

## Phase 4: The Transaction & Fulfillment Pipeline
- [x] Create the Next.js API route `/api/webhooks/stripe` to listen for Stripe webhooks.
- [x] Implement the webhook handler to process `checkout.session.completed` events.
- [x] Add logic to the webhook handler to parse the customer's shipping address and purchased items.
- [x] Insert a new record into the Supabase `orders` table containing the customer's email, name, shipping address, and Stripe session ID (for future CRM use).
- [x] Implement the Printful API `POST /orders` call within the webhook to automatically dispatch the multi-item order for fulfillment.
- [x] Update the `orders` table record with the returned `printful_order_id`.

## Phase 5: Execution & Deployment
- [ ] Execute the "Earth Day" POD sprint by running `headless_pod.py` with 3-5 prompts targeting "Earth Day 2026 Apparel & Gifts".
- [ ] Execute the "Beagle Rescue" emotional hook by running `headless_pod.py` with 2-3 prompts targeting "Support Rescue Dogs".
- [ ] Perform the On-Page Pivot: Update `H1`, `Title Tags`, and editorial text in `src/lib/guide-content.ts` for the targeted categories.
- [ ] Run `python update_counts.py` and deploy the changes via `.\deploy.ps1`.
