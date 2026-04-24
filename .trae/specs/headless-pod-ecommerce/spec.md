# Headless AI Print-on-Demand E-Commerce Spec

## 1. Overview
This specification outlines the architecture and implementation for transforming Easy Street Markets (ESM) into a fully headless Print-on-Demand (POD) e-commerce platform. It enables generating AI designs, creating Printful products, managing a native shopping cart, and automating fulfillment via Stripe without leaving the IDE chat session.

## 2. Architecture & Data Flow

### 2.1 The "Chat-to-Store" CLI Engine (`scripts/headless_pod.py`)
A Python-based CLI tool acting as the control center.
- **Input**: A text prompt (e.g., "Earth Day minimalist line-art").
- **Step 1 (AI Generation)**: Calls OpenAI DALL-E 3 API to generate a transparent PNG.
- **Step 2 (POD Upload)**: Pushes the PNG to Printful via `POST /files`.
- **Step 3 (Mockup Creation)**: Calls Printful `POST /mockup-generator/create-task` to place the artwork on predefined products (e.g., Bella+Canvas 3001 T-Shirt) and downloads the mockup URLs.
- **Step 4 (Stripe Registration)**: Calls the Stripe API to create a `Product` and `Price` object.
- **Step 5 (Database Sync)**: Formats the payload (Mockup URL, Stripe Price ID, Printful Sync Variant ID) and inserts it into the Supabase `products` table via `insert_supabase.py`.

### 2.2 The Native Next.js Shopping Cart
A lightweight client-side shopping cart built directly into `easystreetmarkets.com`.
- **State Management**: Uses React Context + `localStorage` (or `use-shopping-cart` library) to manage line items.
- **UI Components**:
  - `AddToCartButton`: Appended to the product page.
  - `CartDrawer` / `/cart` page: Displays selected items, quantities, and a "Checkout" button.

### 2.3 The Transaction & Fulfillment Pipeline
- **Dynamic Checkout**: When "Checkout" is clicked, a Next.js Server Action (`createCheckoutSession`) is called. It constructs a dynamic Stripe Checkout Session containing the exact line items and redirects the user to Stripe's hosted payment page.
- **Webhook Handler (`/api/webhooks/stripe`)**: 
  - Listens for `checkout.session.completed`.
  - Parses the customer's shipping address and purchased `price_id`s.
  - Maps the Stripe `price_id`s back to the corresponding Printful `variant_id`s (queried from Supabase or embedded in Stripe metadata).
  - Calls Printful `POST /orders` to automatically dispatch the multi-item order for fulfillment.

## 3. Database Schema Updates
The Supabase database requires the following schema updates to support the headless POD architecture and future CRM capabilities:

**Table: `products`**
- `stripe_price_id` (string): The unique identifier for the Stripe Price object.
- `printful_variant_id` (string): The unique identifier for the Printful product variant to be used in the `/orders` API call.
- `product_type` (string): Enum (e.g., 'affiliate', 'pod') to determine if the "Buy Now" button routes to Amazon or "Add to Cart".

**New Table: `orders` (For Future CRM)**
To build a customer database without forcing account creation:
- `id` (uuid): Primary key.
- `stripe_session_id` (string): The Stripe checkout session ID.
- `customer_email` (string): Collected securely during guest checkout.
- `customer_name` (string): The customer's shipping name.
- `shipping_address` (jsonb): The full shipping address payload.
- `order_total` (numeric): Total amount paid.
- `printful_order_id` (string): The ID returned by the Printful API after successful fulfillment submission.
- `created_at` (timestamp).

## 4. Constraints & Rules
- **Guest Checkout Only (No Auth)**: To maximize conversion rates for impulse purchases and keep the architecture lean, we will NOT implement user accounts or authentication. Stripe Checkout natively handles guest email and shipping address collection, which is passed directly to the Printful webhook for fulfillment.
- **SEO Safety**: No URL slugs will be changed during the "Earth Day" or "Beagle" on-page pivots. We will update `H1`, `Title Tags`, and editorial text only.
- **Pagination & Caching**: We must respect the path-based pagination rule (`/[category]/page/2/`). Following any DB syncs by the CLI engine, `python update_counts.py` and `.\deploy.ps1` must be executed to bust the Next.js ISR cache.
- **Supabase Integrity**: The CLI engine must use `on_conflict='slug'` during insertion to ensure idempotent operations.
- **Cloudflare Limits**: Webhooks must be edge-compatible or run within the Cloudflare Worker CPU limits.

## 5. API Integrations
1. **OpenAI**: DALL-E 3 for image generation.
2. **Printful**: `/files`, `/mockup-generator/create-task`, `/orders`.
3. **Stripe**: `/v1/products`, `/v1/prices`, `/v1/checkout/sessions`, Webhooks.