from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_make_portfolio_fields_optional'),
    ]

    operations = [
        migrations.AlterField(
            model_name='storeproduct',
            name='id',
            field=models.CharField(blank=True, max_length=50, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='storeproduct',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='Description'),
        ),
    ]
