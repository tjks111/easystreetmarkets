import json
import os
from supabase import create_client, Client

SUPABASE_URL = "https://ykpgulbugkxiqldvgsjs.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcGd1bGJ1Z2t4aXFsZHZnc2pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA2ODczNiwiZXhwIjoyMDkxNjQ0NzM2fQ.cYjNZLXkf_umD8TNnLpViHl2h5T0gOUZWgqtvuWIDdA"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def main():
    file_path = r'C:\Users\rento\easystreetmarkets\products_to_insert_batch2.json'
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
        
    with open(file_path, 'r') as f:
        raw_products = json.load(f)
        
    if not raw_products:
        print("No products to insert.")
        return
        
    # Remove duplicates based on slug within the JSON itself
    seen_slugs = set()
    products = []
    for p in raw_products:
        if p.get('slug') and p['slug'] not in seen_slugs:
            seen_slugs.add(p['slug'])
            # Default to affiliate if not specified
            if 'product_type' not in p:
                p['product_type'] = 'affiliate'
            products.append(p)
            
    print(f"Loaded {len(raw_products)} products. After removing internal duplicates: {len(products)} products.")
    
    total_inserted = 0
    for batch in chunk_list(products, 100):
        try:
            # upsert based on the unique 'slug' column
            import time
            print(f"Upserting {len(batch)} records...")
            response = supabase.table('products').upsert(batch, on_conflict='slug').execute()
            time.sleep(1)  # Rate limiting protection
            print(f"Inserted/Updated batch of {len(batch)} products.")
            total_inserted += len(batch)
        except Exception as e:
            print(f"Failed to insert batch: {e}")
            
    print(f"\nSuccessfully processed {total_inserted} products!")

if __name__ == "__main__":
    main()
