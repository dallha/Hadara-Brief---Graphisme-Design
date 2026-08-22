from django.db import migrations
from django.contrib.auth.hashers import make_password
import os

def update_superuser_password(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    try:
        admin_user = User.objects.get(username='admin')
        admin_user.password = make_password(os.environ.get('ADMIN_PASSWORD', ''))
        admin_user.save()
    except User.DoesNotExist:
        pass

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_create_superuser'),
    ]

    operations = [
        migrations.RunPython(update_superuser_password),
    ]
