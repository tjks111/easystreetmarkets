import json
import os
from supabase import create_client, Client

SUPABASE_URL = "https://ykpgulbugkxiqldvgsjs.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcGd1bGJ1Z2t4aXFsZHZnc2pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA2ODczNiwiZXhwIjoyMDkxNjQ0NzM2fQ.cYjNZLXkf_umD8TNnLpViHl2h5T0gOUZWgqtvuWIDdA"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def main():
    print("Querying top 15 tiger products...")
    response = supabase.table('products') \
        .select("slug, name, image_url, price_min, source, rating, review_count, category") \
        .eq("animal", "tiger") \
        .eq("in_stock", True) \
        .order("is_featured", desc=True, nullsfirst=False) \
        .order("rating", desc=True, nullsfirst=False) \
        .limit(15) \
        .execute()
        
    data = response.data
    print(f"Found {len(data)} tiger products.")
    
    out_file = r'C:\Users\rento\easystreetmarkets\blog_products_today.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump({"tiger": data}, f, indent=2)
        
    print(f"Saved to {out_file}")

if __name__ == "__main__":
    main()
