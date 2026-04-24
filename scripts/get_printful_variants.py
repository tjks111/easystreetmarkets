import os
import requests
from dotenv import load_dotenv
load_dotenv('.env.local')

PRINTFUL_API_KEY = os.getenv('PRINTFUL_API_KEY')
STORE_ID = "18064392"

headers = {
    "Authorization": f"Bearer {PRINTFUL_API_KEY}",
    "X-PF-Store-Id": STORE_ID
}

res = requests.get("https://api.printful.com/products/71", headers=headers)
print(res.json())