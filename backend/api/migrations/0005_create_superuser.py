from django.db import migrations
from django.contrib.auth.hashers import make_password
import os

def create_superuser(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@hadara.com',
            'is_superuser': True,
            'is_staff': True,
            'is_active': True,
        }
    )
    
    if created:
        admin_user.password = make_password('hadara2026')
        admin_user.save()
    else:
        admin_user.password = make_password('hadara2026')
        admin_user.is_superuser = True
        admin_user.is_staff = True
        admin_user.save()

def remove_superuser(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    User.objects.filter(username='admin').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_update_store_images'),
        ('auth', '__latest__'),
    ]

    operations = [
        migrations.RunPython(create_superuser, reverse_code=remove_superuser),
    ]
