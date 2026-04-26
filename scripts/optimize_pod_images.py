import os
import requests
import re
import random
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env.local
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env.local")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_seo_filename(name, color):
    # Convert to lowercase
    clean_name = name.lower()
    
    # Replace 'tee' with 'shirt' for better SEO commercial intent
    clean_name = clean_name.replace(' tee', ' shirt')
    
    # Replace ' - ' with '-'
    clean_name = clean_name.replace(' - ', '-')
    
    # Remove any character that is not alphanumeric, space, or hyphen
    clean_name = re.sub(r'[^a-z0-9\s-]', '', clean_name)
    
    # Replace spaces with hyphens and collapse multiple hyphens
    clean_name = re.sub(r'\s+', '-', clean_name).strip('-')
    
    clean_color = color.lower().strip()
    
    # Construct filename
    filename = f"buy-{clean_name}-gift-{clean_color}.png"
    return filename

def download_image(url):
    response = requests.get(url)
    response.raise_for_status()
    return response.content

def process_products():
    print("Fetching POD products...")
    response = supabase.table('products').select('*').eq('product_type', 'pod').execute()
    products = response.data
    
    print(f"Found {len(products)} POD products to optimize.")
    
    updated_count = 0
    
    for product in products:
        product_id = product['id']
        name = product.get('name', 'product')
        variants = product.get('variants', [])
        
        if not variants:
            print(f"Skipping {name} - no variants.")
            continue
            
        new_variants = []
        needs_db_update = False
        
        for variant in variants:
            color = variant.get('color', 'white')
            current_image_url = variant.get('image_url')
            
            if not current_image_url:
                new_variants.append(variant)
                continue
                
            seo_filename = generate_seo_filename(name, color)
            
            if seo_filename in current_image_url:
                new_variants.append(variant)
                continue
                
            print(f"Optimizing {name} ({color}) -> {seo_filename}")
            try:
                img_data = download_image(current_image_url)
                path = f"pod_mockups/{seo_filename}"
                supabase.storage.from_('product-images').upload(
                    path,
                    img_data,
                    {"content-type": "image/png", "upsert": "true"}
                )
                
                new_public_url = supabase.storage.from_('product-images').get_public_url(path)
                variant['image_url'] = new_public_url
                needs_db_update = True
            except Exception as e:
                print(f"Error processing {current_image_url} for {name}: {e}")
                
            new_variants.append(variant)
            
        current_default_url = product.get('image_url')
        
        if new_variants:
            random_variant = random.choice(new_variants)
            new_default_url = random_variant['image_url']
            
            if new_default_url != current_default_url:
                needs_db_update = True
        else:
            new_default_url = current_default_url
            
        if needs_db_update:
            print(f"Updating product DB record for '{name}' with randomized default image color...")
            try:
                supabase.table('products').update({
                    'variants': new_variants,
                    'image_url': new_default_url
                }).eq('id', product_id).execute()
                updated_count += 1
            except Exception as e:
                print(f"Error updating DB for {name}: {e}")
                
    print(f"\nOptimization complete! Updated {updated_count} products.")

if __name__ == "__main__":
    process_products()