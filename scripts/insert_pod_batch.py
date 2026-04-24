import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('.env.local')

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

with open('products_to_insert_batch2.json', 'r') as f:
    products = json.load(f)

for product in products:
    try:
        res = supabase.table('products').upsert(product, on_conflict='slug').execute()
        print(f"Inserted: {product['name']}")
    except Exception as e:
        print(f"Error inserting {product['name']}: {e}")
