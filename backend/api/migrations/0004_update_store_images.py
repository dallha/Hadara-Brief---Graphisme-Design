from django.db import migrations

def update_store_images(apps, schema_editor):
    StoreProduct = apps.get_model('api', 'StoreProduct')
    products = StoreProduct.objects.all().order_by('id')
    
    for i, product in enumerate(products):
        if i < 12:
            num = str(i+1).zfill(2)
            product.image = f"/images/store/prod-{num}.jpg"
            product.save()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_seed_store_products'),
    ]

    operations = [
        migrations.RunPython(update_store_images),
    ]
