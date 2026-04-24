import os
import json
import time
import requests
from dotenv import load_dotenv
import rembg
from PIL import Image
import io
from supabase import create_client, Client

# Load environment variables
load_dotenv('.env.local')

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PRINTFUL_API_KEY = os.getenv('PRINTFUL_API_KEY')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Config constants
PRINTFUL_API_URL = "https://api.printful.com"
STRIPE_API_URL = "https://api.stripe.com/v1"
STORE_ID = "18064392"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_image(prompt):
    print(f"Generating image with prompt: {prompt}")
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "dall-e-3",
        "prompt": prompt + " Solid white background.",
        "n": 1,
        "size": "1024x1024",
        "response_format": "url"
    }
    response = requests.post("https://api.openai.com/v1/images/generations", headers=headers, json=data)
    response.raise_for_status()
    image_url = response.json()['data'][0]['url']
    print(f"Generated image URL: {image_url}")
    return image_url

def remove_background(image_url):
    print("Downloading and removing background...")
    response = requests.get(image_url)
    response.raise_for_status()
    input_image = response.content
    output_image = rembg.remove(input_image)
    
    # Resize and optimize to avoid Supabase 5MB payload limit
    img = Image.open(io.BytesIO(output_image))
    img.thumbnail((800, 800))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()

def upload_to_supabase_storage(image_bytes, filename):
    print("Uploading transparent image to Supabase Storage...")
    path = f"pod_temp/{filename}"
    res = supabase.storage.from_('product-images').upload(
        path,
        image_bytes,
        {"content-type": "image/png", "upsert": "true"}
    )
    public_url = supabase.storage.from_('product-images').get_public_url(path)
    print(f"Supabase Public URL: {public_url}")
    return public_url

def create_multi_color_mockups(image_url, product_id=71):
    print("Creating multi-color Printful mockup task...")
    headers = {
        "Authorization": f"Bearer {PRINTFUL_API_KEY}",
        "Content-Type": "application/json",
        "X-PF-Store-Id": STORE_ID
    }
    
    color_variants = {
        "White": 4012,
        "Black": 4017,
        "Navy": 4067
    }
    variant_ids = list(color_variants.values())
    
    data = {
        "variant_ids": variant_ids,
        "format": "png",
        "files": [
            {
                "placement": "front",
                "image_url": image_url,
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
    
    # 1. Start Mockup Task
    response = requests.post(f"{PRINTFUL_API_URL}/mockup-generator/create-task/{product_id}", headers=headers, json=data)
    response.raise_for_status()
    task_key = response.json()['result']['task_key']
    
    # 2. Poll for Completion
    print(f"Waiting for mockup task {task_key} to complete...")
    for _ in range(15):
        time.sleep(5)
        poll_res = requests.get(f"{PRINTFUL_API_URL}/mockup-generator/task?task_key={task_key}", headers=headers)
        poll_res.raise_for_status()
        result = poll_res.json()['result']
        if result['status'] == 'completed':
            print("Mockups created.")
            return result['mockups']
            
    raise Exception("Mockup generation timed out")

def download_and_upload_mockup(mockup_url, filename):
    print(f"Downloading {mockup_url}...")
    response = requests.get(mockup_url)
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

def create_stripe_product(name, description, image_url, price_cents=2500):
    print("Creating Stripe Product and Price...")
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    prod_data = {
        "name": name,
        "description": description,
        "images[0]": image_url
    }
    prod_res = requests.post(f"{STRIPE_API_URL}/products", headers=headers, data=prod_data)
    prod_res.raise_for_status()
    stripe_product_id = prod_res.json()['id']
    
    price_data = {
        "product": stripe_product_id,
        "unit_amount": price_cents,
        "currency": "usd"
    }
    price_res = requests.post(f"{STRIPE_API_URL}/prices", headers=headers, data=price_data)
    price_res.raise_for_status()
    stripe_price_id = price_res.json()['id']
    print(f"Stripe Product created. Price ID: {stripe_price_id}")
    return stripe_price_id

def save_to_json(product_data, filename="products_to_insert_earthday.json"):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        data = []
        
    data.append(product_data)
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Saved payload to {filename}")

if __name__ == "__main__":
    print("Starting Headless POD Earth Day Sprint (300 products)...")
    
    top_10_animals = [
        "sea-turtle", "elephant", "wolf", "tiger", "bear", 
        "lion", "owl", "penguin", "fox", "dolphin"
    ]
    
    styles = [
        "minimalist line-art, solid white background",
        "watercolor illustration, solid white background",
        "geometric low-poly vector, solid white background"
    ]
    
    # We will generate 30 per animal. For demonstration, we construct the prompts dynamically.
    all_prompts = []
    for animal in top_10_animals:
        for i in range(30):
            style = styles[i % len(styles)]
            prompt = f"Earth Day 2026 themed {animal} design, {style}, emphasizing nature conservation."
            slug = f"earth-day-{animal}-t-shirt-vol-{i+1}"
            all_prompts.append({
                "category": "t-shirts",
                "animal": animal,
                "prompt": prompt,
                "slug": slug,
                "name": f"Earth Day {animal.replace('-', ' ').title()} Tee - Vol {i+1}",
                "price": 2600
            })
            
    print(f"Generated {len(all_prompts)} prompts. Beginning processing...")
    
    # For execution safety, we'll process them in order.
    # Note: Generating 300 products will take hours due to rate limits.
    try:
        with open("products_to_insert_earthday.json", "r") as f:
            existing_data = json.load(f)
            existing_names = {item["name"] for item in existing_data}
    except FileNotFoundError:
        existing_names = set()

    for idx, item in enumerate(all_prompts):
        if item['name'] in existing_names:
            print(f"Skipping {item['name']}, already exists.")
            continue
        
        print(f"\n--- Processing {idx+1}/{len(all_prompts)}: {item['name']} ---")
        try:
            # 1. Generate Image
            img_url = generate_image(item['prompt'])
            
            # 2. Remove Background
            transparent_bytes = remove_background(img_url)
            
            # 3. Upload to Supabase Storage
            timestamp = int(time.time())
            filename = f"pod_{item['animal']}_{timestamp}.png"
            public_url = upload_to_supabase_storage(transparent_bytes, filename)
            
            # 4. Create Mockups via Printful
            mockups = create_multi_color_mockups(public_url)
            
            color_variants_map = {
                4012: "White",
                4017: "Black",
                4067: "Navy"
            }
            
            variants = []
            primary_mockup_url = ""
            
            for m in mockups:
                variant_id = m.get('variant_id')
                if not variant_id and 'variant_ids' in m and m['variant_ids']:
                    variant_id = m['variant_ids'][0]
                if not variant_id:
                    continue
                color_name = color_variants_map.get(variant_id, "Unknown")
                mockup_url = m['mockup_url']
                
                filename = f"{item['slug']}-{color_name.lower()}.png"
                supabase_url = download_and_upload_mockup(mockup_url, filename)
                
                variants.append({
                    "color": color_name,
                    "image_url": supabase_url,
                    "variant_id": str(variant_id)
                })
                
                if color_name == "White" or not primary_mockup_url:
                    primary_mockup_url = supabase_url
            
            # 5. Create Stripe Product
            stripe_id = create_stripe_product(item['name'], "Exclusive Earth Day 2026 Print-on-Demand design.", primary_mockup_url, item['price'])
            
            # 6. Build DB Payload
            product_payload = {
                "slug": item['slug'],
                "name": item['name'],
                "description": "Exclusive Earth Day 2026 Print-on-Demand design.",
                "category": item['category'],
                "animal": item['animal'],
                "image_url": primary_mockup_url,
                "price_min": item['price'] / 100,
                "price_max": item['price'] / 100,
                "source": "printful-own",
                "is_own_product": True,
                "is_featured": True,
                "product_type": "pod",
                "stripe_price_id": stripe_id,
                "printful_variant_id": "4012", # Default variant
                "variants": variants,
                "in_stock": True,
                "review_count": 0,
                "rating": None
            }
            
            # 7. Save locally and insert to Supabase
            save_to_json(product_payload)
            supabase.table('products').upsert(product_payload, on_conflict='slug').execute()
            print(f"Successfully inserted {item['name']} into Supabase.")
            
            print("Skipping sleep as Printful API restrictions are bypassed for this Store ID...")
            time.sleep(1)
        except Exception as e:
            print(f"Error processing {item['name']}: {e}")
            time.sleep(10) # Brief pause on error
    print("Earth Day Sprint complete.")
