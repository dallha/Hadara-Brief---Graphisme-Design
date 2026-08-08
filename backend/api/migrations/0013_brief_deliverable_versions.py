from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_make_storeproduct_fields_optional'),
    ]

    operations = [
        migrations.AddField(
            model_name='brief',
            name='deliverable_versions',
            field=models.JSONField(blank=True, default=list, null=True, verbose_name='Versions de Livrables (V1, V2, V3)'),
        ),
    ]
