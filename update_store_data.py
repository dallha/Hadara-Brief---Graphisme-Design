import re

with open('src/data/storeData.ts', 'r') as f:
    content = f.read()

urls = re.findall(r"imageUrl:\s*'([^']+)'", content)

for i, url in enumerate(urls):
    num = str(i+1).zfill(2)
    new_url = f"/images/store/prod-{num}.jpg"
    content = content.replace(url, new_url)

with open('src/data/storeData.ts', 'w') as f:
    f.write(content)

print("Updated storeData.ts")
