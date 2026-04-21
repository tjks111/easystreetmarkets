import os
import requests
import json
import time

# RapidAPI configuration
RAPIDAPI_HOST = "amazon-online-data-api.p.rapidapi.com"
RAPIDAPI_KEY = "41e244e87bmshdf2bd5b42cfe5abp15e3e5jsn7883d74b3be2"
SEARCH_URL = "https://amazon-online-data-api.p.rapidapi.com/search"

def search_amazon(query, page=1):
    headers = {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY
    }
    querystring = {"query": query, "page": str(page), "geo": "US"}
    
    print(f"Fetching page {page} for: {query}")
    response = requests.get(SEARCH_URL, headers=headers, params=querystring)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None

def process_data(animal, api_data):
    if not api_data or 'products' not in api_data:
        return []

    products = api_data['products']
    valid_products = []
    
    for item in products:
        try:
            # We only want items with a price and URL
            if not item.get('product_url') or not item.get('product_price'):
                continue
                
            asin = item.get('asin')
            title = item.get('product_title', '')
            url = item.get('product_url', '')
            image_url = item.get('product_photo', '')
            
            # Clean up price (remove $ and commas)
            price_str = str(item.get('product_price', '0')).replace('$', '').replace(',', '')
            try:
                price = float(price_str)
            except ValueError:
                continue
                
            rating = item.get('product_star_rating')
            if rating:
                try:
                    rating = float(rating)
                except ValueError:
                    rating = None
            else:
                rating = None
                
            review_count = item.get('product_num_ratings')
            
            # Prepare payload
            product_data = {
                "slug": f"amz-{asin}",
                "name": title,
                "category": "art-prints",
                "animal": animal,
                "source": "amazon",
                "source_url": url,
                "affiliate_url": f"{url}?tag=tjks111-20",
                "image_url": image_url,
                "price_min": price,
                "price_max": price,
                "in_stock": True,
                "rating": rating,
                "review_count": review_count
            }
            
            valid_products.append(product_data)
            
        except Exception as e:
            print(f"Failed to process product {item.get('asin')}: {e}")
            
    return valid_products

def main():
    # Exactly 60 animals from the platform
    all_animals = [
        'lion', 'bear', 'alligator', 'dragonfly', 'badger', 'bison', 'pelican', 'hummingbird', 
        'tree-frog', 'chipmunk', 'shark', 'frog', 'sea-turtle', 'elephant', 'bald-eagle', 
        'rabbit', 'wolf', 'cardinal', 'chameleon', 'bee', 'coyote', 'monarch-butterfly', 
        'tiger', 'dolphin', 'owl', 'deer', 'whale', 'beaver', 'fox', 'flamingo', 'moose', 
        'otter', 'penguin', 'mountain-lion', 'raccoon', 'bobcat', 'elk', 'squirrel', 'bat', 
        'jellyfish', 'gecko', 'octopus', 'seahorse', 'snake', 'hawk', 'ladybug', 'dinosaur', 
        'heron', 'coral-reef', 'manta-ray', 'clownfish', 'polar-bear', 'parrot', 'whale-shark', 
        'starfish', 'cheetah', 'gorilla', 'sloth', 'panda', 'koala'
    ]
    
    TARGET_PRODUCTS_PER_ANIMAL = 80
    all_products = []
    
    # We will stop immediately if we hit an API error (like 429 Too Many Requests) to save what we have
    stop_scraping = False

    for animal in all_animals:
        if stop_scraping:
            break
            
        print(f"\n--- Processing animal: {animal} ---")
        animal_products = []
        page = 1
        
        while len(animal_products) < TARGET_PRODUCTS_PER_ANIMAL:
            query = f"{animal} canvas wall art"
            data = search_amazon(query, page=page)
            
            if not data:
                # API error or empty response
                print("Stopping due to API error or no data returned.")
                stop_scraping = True
                break
                
            processed = process_data(animal, data)
            
            if not processed:
                print(f"No valid products found on page {page} for {animal}.")
                break # Move to next animal if we exhausted valid products
                
            animal_products.extend(processed)
            print(f"Found {len(processed)} valid products. Total for {animal}: {len(animal_products)}")
            
            if len(animal_products) >= TARGET_PRODUCTS_PER_ANIMAL:
                break
                
            page += 1
            time.sleep(1) # Small delay to be polite to the API
            
        # Truncate if we went slightly over the target
        animal_products = animal_products[:TARGET_PRODUCTS_PER_ANIMAL]
        all_products.extend(animal_products)
        print(f"Finalized {len(animal_products)} products for {animal}.")
            
    # Save to JSON
    output_file = r'C:\Users\rento\easystreetmarkets\products_to_insert_batch2.json'
    with open(output_file, 'w') as f:
        json.dump(all_products, f, indent=2)
        
    print(f"\nTotal products ready for insert: {len(all_products)}")
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    main()