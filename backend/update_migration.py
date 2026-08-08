import re

with open('api/migrations/0003_seed_store_products.py', 'r') as f:
    content = f.read()

urls = re.findall(r"'image':\s*'([^']+)'", content)

for i, url in enumerate(urls):
    if 'unsplash' in url:
        num = str(i+1).zfill(2)
        new_url = f"/images/store/prod-{num}.jpg"
        content = content.replace(url, new_url)

with open('api/migrations/0003_seed_store_products.py', 'w') as f:
    f.write(content)

print("Updated 0003_seed_store_products.py")
