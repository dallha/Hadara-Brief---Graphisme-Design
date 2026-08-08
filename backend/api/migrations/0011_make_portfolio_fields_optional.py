from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_make_template_fields_optional'),
    ]

    operations = [
        migrations.AlterField(
            model_name='portfolioitem',
            name='id',
            field=models.CharField(blank=True, max_length=50, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='portfolioitem',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='Description'),
        ),
        migrations.AlterField(
            model_name='portfolioitem',
            name='accent_hex',
            field=models.CharField(blank=True, default='#816C07', max_length=50, verbose_name="Couleur d'Accent Visuel"),
        ),
        migrations.AlterField(
            model_name='portfolioitem',
            name='features',
            field=models.JSONField(blank=True, default=list, verbose_name='Livrables Inclus'),
        ),
    ]
