# SQL Evidence Log
**Timestamp**: 2026-04-23
**Action**: Headless POD Migration (Pending Execution)
**Risk Level**: WRITE / DDL
**Status**: User approved. Awaiting manual execution due to lack of DB connection string.

## Plan Summary
- **Target**: Supabase Project `ykpgulbugkxiqldvgsjs`
- **Affected Objects**: `products` table (ADD 3 columns), `orders` table (CREATE), RLS (ENABLE).
- **Rollback SQL**: Included in the artifact.
- **Expected Row Counts**: 0 rows affected (DDL only).

## SQL Statement
```sql
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
```

## Outcome
Saved to `07-artifacts/2026-04-23_headless_pod_migration.sql`.
Please execute this in the Supabase SQL Editor.