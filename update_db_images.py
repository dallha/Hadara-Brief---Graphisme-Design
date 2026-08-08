import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import StoreProduct

products = StoreProduct.objects.all().order_by('id')
for i, product in enumerate(products):
    num = str(i+1).zfill(2)
    product.image = f"/images/store/prod-{num}.jpg"
    product.save()

print(f"Updated {products.count()} products in the database.")
