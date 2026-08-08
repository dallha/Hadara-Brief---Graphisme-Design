from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_brief_deliverable_versions'),
    ]

    operations = [
        migrations.AlterField(
            model_name='brief',
            name='target_audience_chips',
            field=models.JSONField(blank=True, default=list, null=True, verbose_name='Tags Cible'),
        ),
    ]
