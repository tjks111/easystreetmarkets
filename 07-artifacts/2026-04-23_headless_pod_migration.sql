-- Up Migration: Headless POD Schema Changes
-- Adds POD capability and customer order CRM to Supabase

-- 1. Add new columns to products table
ALTER TABLE products
ADD COLUMN stripe_price_id text,
ADD COLUMN printful_variant_id text,
ADD COLUMN product_type text DEFAULT 'affiliate';

-- 2. Create orders table for CRM
CREATE TABLE orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id text,
    customer_email text,
    customer_name text,
    shipping_address jsonb,
    order_total numeric,
    printful_order_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Down Migration (Rollback Plan)
/*
ALTER TABLE products 
DROP COLUMN stripe_price_id,
DROP COLUMN printful_variant_id,
DROP COLUMN product_type;

DROP TABLE orders;
*/