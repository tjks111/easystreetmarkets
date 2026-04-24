import os
import re

TARGET_DIR = r"c:\Users\rento\easystreetmarkets\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Replace static trailing slashes in hrefs like href="/animals/" -> href="/animals"
    content = re.sub(r'href="(/[^"]+)/"', r'href="\1"', content)

    # 2. Replace dynamic trailing slashes in hrefs like href={`/${category}/`} -> href={`/${category}`}
    # Need to be careful with things like `/go/${product.slug}/` or `${SITE_URL}/${category}/`
    content = re.sub(r'href=\{`(/[^`]+)/`\}', r'href={`\1`}', content)
    
    # 3. Replace canonicals like alternates: { canonical: `${SITE_URL}/animals/${slug}/` } -> alternates: { canonical: `${SITE_URL}/animals/${slug}` }
    content = re.sub(r'canonical:\s*`\$\{SITE_URL\}(/[^`]+)/`', r'canonical: `${SITE_URL}\1`', content)
    
    # 4. Replace string canonicals like canonicalUrl = `${SITE_URL}/${category}/`; -> canonicalUrl = `${SITE_URL}/${category}`;
    content = re.sub(r'=\s*`\$\{SITE_URL\}(/[^`]+)/`', r'= `${SITE_URL}\1`', content)
    
    # 5. Static canonical alternates: { canonical: "/blog/" } -> alternates: { canonical: "/blog" }
    content = re.sub(r'canonical:\s*"/([^"]+)/"', r'canonical: "/\1"', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            process_file(os.path.join(root, file))

print("Done stripping trailing slashes from src/")