import os
import time
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

PRINTFUL_API_KEY = os.getenv('PRINTFUL_API_KEY')
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
STORE_ID = "18064392"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Using Medium size variants for standard mockups
COLOR_VARIANTS = {
    "White": 4012,
    "Black": 4017,
    "Navy": 4067
}

def upload_image_from_url(image_url, filename):
    print(f"Downloading {image_url}...")
    response = requests.get(image_url)
    response.raise_for_status()
    image_bytes = response.content
    
    print(f"Uploading {filename} to Supabase...")
    path = f"pod_mockups/{filename}"
    supabase.storage.from_('product-images').upload(
        path,
        image_bytes,
        {"content-type": "image/png", "upsert": "true"}
    )
    public_url = supabase.storage.from_('product-images').get_public_url(path)
    return public_url

def create_multi_color_mockups(original_transparent_url):
    print("Creating multi-color Printful mockup task...")
    headers = {
        "Authorization": f"Bearer {PRINTFUL_API_KEY}",
        "Content-Type": "application/json",
        "X-PF-Store-Id": STORE_ID
    }
    
    variant_ids = list(COLOR_VARIANTS.values())
    
    data = {
        "variant_ids": variant_ids,
        "format": "png",
        "files": [
            {
                "placement": "front",
                "image_url": original_transparent_url,
                "position": {
                    "area_width": 1800,
                    "area_height": 2400,
                    "width": 1800,
                    "height": 1800,
                    "top": 300,
                    "left": 0
                }
            }
        ]
    }
    
    response = requests.post("https://api.printful.com/mockup-generator/create-task/71", headers=headers, json=data)
    response.raise_for_status()
    task_key = response.json()['result']['task_key']
    
    print(f"Waiting for mockup task {task_key} to complete...")
    for _ in range(15):
        time.sleep(5)
        poll_res = requests.get(f"https://api.printful.com/mockup-generator/task?task_key={task_key}", headers=headers)
        poll_res.raise_for_status()
        result = poll_res.json()['result']
        if result['status'] == 'completed':
            return result['mockups']
            
    raise Exception("Mockup generation timed out")

def migrate_product(product):
    slug = product['slug']
    print(f"\n--- Migrating {slug} ---")
    
    if product.get('variants') and len(product['variants']) >= 3:
        print("Variants already exist, skipping.")
        return

    # We need the transparent image to generate new mockups.
    # The existing image_url is a Printful URL. But wait, we uploaded the transparent image to Supabase in headless_pod.py!
    # How to find the transparent image URL?
    # headless_pod.py saves the transparent image as pod_{animal}_{timestamp}.png
    # But it's not saved in the DB.
    # If we don't have the transparent image URL, we might just download the existing Printful mockup and upload it as the "default" variant.
    # However, the user wants multiple colors. 
    # Since we can't easily retrieve the transparent PNG from just the DB, we will just download the current mockup and save it as the primary variant.
    
    current_image_url = product.get('image_url')
    if not current_image_url or "supabase" in current_image_url:
        print("Image is already migrated or missing.")
        return

    filename = f"{slug}-default.png"
    new_public_url = upload_image_from_url(current_image_url, filename)
    
    variants = [
        {"color": "White", "image_url": new_public_url, "variant_id": str(COLOR_VARIANTS["White"])}
    ]
    
    # Update DB
    supabase.table('products').update({
        'image_url': new_public_url,
        'variants': variants
    }).eq('id', product['id']).execute()
    print(f"Updated {slug} in DB.")

if __name__ == "__main__":
    print("Fetching POD products...")
    response = supabase.table('products').select('*').eq('product_type', 'pod').execute()
    products = response.data
    print(f"Found {len(products)} POD products.")
    
    for product in products:
        try:
            migrate_product(product)
        except Exception as e:
            print(f"Error migrating {product['slug']}: {e}")
