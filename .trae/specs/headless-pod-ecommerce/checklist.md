# Headless AI Print-on-Demand E-Commerce Verification Checklist

## Pre-Requisites & Configuration
- [ ] Printful API Key is securely stored in a local `.env` file.
- [ ] OpenAI API Key is securely stored in a local `.env` file.
- [ ] Stripe Secret Key is securely stored in a local `.env` file.
- [ ] Supabase `products` table has the required `stripe_price_id`, `printful_variant_id`, and `product_type` columns.

## Database & Model Verification
- [ ] `insert_supabase.py` successfully inserts a POD product into Supabase with all new fields.
- [ ] `update_counts.py` successfully syncs the `product_count` column without errors.

## AI & Printful "Chat-to-Store" Pipeline
- [ ] `headless_pod.py` successfully generates a transparent PNG via OpenAI DALL-E 3 based on a text prompt.
- [ ] `headless_pod.py` successfully uploads the PNG to Printful via `POST /files`.
- [ ] `headless_pod.py` successfully generates high-quality mockups via Printful's Mockup Generator API.
- [ ] `headless_pod.py` successfully registers a `Product` and `Price` object in Stripe.
- [ ] The generated payload is correctly formatted and passed to `insert_supabase.py`.

## Next.js Shopping Cart Verification
- [ ] `ProductCard` correctly renders an "Add to Cart" button for POD products and an Amazon affiliate link for affiliate products.
- [ ] The client-side shopping cart correctly manages global state (adding, removing, updating quantities).
- [ ] The `/cart` page or `CartDrawer` accurately displays the selected items, quantities, and totals.
- [ ] Clicking "Checkout" successfully calls the `createCheckoutSession` Server Action and redirects to a Stripe Checkout Session containing all cart items.

## Transaction & Fulfillment Webhook Verification
- [ ] The Next.js `/api/webhooks/stripe` route successfully listens for and authenticates `checkout.session.completed` events.
- [ ] The webhook correctly parses the customer's shipping address and purchased `price_id`s.
- [ ] The webhook successfully creates a new record in the Supabase `orders` table capturing the customer's details for future CRM use.
- [ ] The webhook correctly maps the Stripe `price_id`s back to the corresponding Printful `variant_id`s.
- [ ] The webhook successfully makes a `POST /orders` request to the Printful API to dispatch the multi-item order.
- [ ] The Supabase `orders` table is successfully updated with the resulting `printful_order_id`.
- [ ] The Stripe webhook does not exceed Cloudflare Worker CPU limits during execution.

## SEO & Deployment Verification
- [ ] The On-Page Pivot for the "Earth Day" and "Beagle" categories successfully updates the `H1`, `Title Tags`, and editorial text without changing the URL slugs.
- [ ] Running `.\deploy.ps1` successfully busts the Next.js ISR cache and reflects the new POD products on the live site.