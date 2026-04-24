import os
import asyncio
from supabase import create_client

SUPABASE_URL = "https://ykpgulbugkxiqldvgsjs.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcGd1bGJ1Z2t4aXFsZHZnc2pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA2ODczNiwiZXhwIjoyMDkxNjQ0NzM2fQ.cYjNZLXkf_umD8TNnLpViHl2h5T0gOUZWgqtvuWIDdA"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def update_counts():
    print("Fetching categories...")
    categories = supabase.table("categories").select("slug").execute()
    
    for cat in categories.data:
        slug = cat["slug"]
        print(f"Counting products for category: {slug}")
        count_res = supabase.table("products").select("id", count="exact").eq("category", slug).eq("in_stock", True).execute()
        count = count_res.count
        print(f"Updating {slug} -> {count}")
        supabase.table("categories").update({"product_count": count}).eq("slug", slug).execute()
        
    print("Fetching animals...")
    animals = supabase.table("animals").select("slug").execute()
    
    for animal in animals.data:
        slug = animal["slug"]
        print(f"Counting products for animal: {slug}")
        count_res = supabase.table("products").select("id", count="exact").eq("animal", slug).eq("in_stock", True).execute()
        count = count_res.count
        print(f"Updating {slug} -> {count}")
        supabase.table("animals").update({"product_count": count}).eq("slug", slug).execute()

    print("Done!")

if __name__ == "__main__":
    update_counts()