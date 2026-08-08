from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_seed_portfolio_and_templates'),
    ]

    operations = [
        migrations.AlterField(
            model_name='template',
            name='id',
            field=models.CharField(blank=True, max_length=50, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='template',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='Description'),
        ),
        migrations.AlterField(
            model_name='template',
            name='default_main_title',
            field=models.CharField(blank=True, max_length=200, null=True, verbose_name='Titre par défaut'),
        ),
        migrations.AlterField(
            model_name='template',
            name='default_full_text_content',
            field=models.TextField(blank=True, null=True, verbose_name='Contenu texte par défaut'),
        ),
        migrations.AlterField(
            model_name='template',
            name='style_preferences',
            field=models.JSONField(blank=True, default=list, null=True, verbose_name='Préférences de style'),
        ),
        migrations.AlterField(
            model_name='template',
            name='preferred_colors',
            field=models.CharField(blank=True, max_length=200, null=True, verbose_name='Couleurs souhaitées'),
        ),
        migrations.AlterField(
            model_name='template',
            name='avoid_colors',
            field=models.CharField(blank=True, max_length=200, null=True, verbose_name='Couleurs à éviter'),
        ),
        migrations.AlterField(
            model_name='template',
            name='default_budget_range',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Fourchette de budget'),
        ),
        migrations.AlterField(
            model_name='template',
            name='suggested_price_fcfa',
            field=models.IntegerField(blank=True, null=True, verbose_name='Prix Indicatif (FCFA)'),
        ),
    ]
