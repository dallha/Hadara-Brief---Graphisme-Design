from django.db import migrations

def seed_portfolio_templates_tools(apps, schema_editor):
    PortfolioItem = apps.get_model('api', 'PortfolioItem')
    Template = apps.get_model('api', 'Template')
    ToolUsageLog = apps.get_model('api', 'ToolUsageLog')

    # Seed Portfolio Items if empty
    if PortfolioItem.objects.count() == 0:
        PortfolioItem.objects.bulk_create([
            PortfolioItem(
                id='PRT-0001',
                title='Pack Hadara Événement 360°',
                category='Packages Booster',
                description='Solution intégrale pour vos événements majeurs (Ziarra, Gamou, Magal & Conférences).',
                image_url='/images/portfolio/pack-event.jpg',
                badge='👑 Premium',
                price_estimate='75 000 FCFA',
                accent_hex='#f59e0b',
                features=['Logo officiel', 'Affiche A3/A4 HD', 'Bâche XXL', 'Flyer A5', 'Visuels Réseaux (1:1 & 16:9)']
            ),
            PortfolioItem(
                id='PRT-0002',
                title='Identité Visuelle Hadara Master',
                category='Identité & Logo',
                description='Conception sur-mesure de votre logo vectoriel et charte graphique complète.',
                image_url='/images/portfolio/logo-master.jpg',
                badge='👑 Premium',
                price_estimate='80 000 FCFA',
                accent_hex='#816C07',
                features=['Logo original vectoriel', 'Favicon site web', 'Palette de couleurs (HEX/CMJN)', 'Guide de charte']
            ),
            PortfolioItem(
                id='PRT-0003',
                title='Pack Branding Professionnel',
                category='Identité & Logo',
                description='Identité complète avec supports de papeterie d\'entreprise et cartes de visite.',
                image_url='/images/portfolio/branding-pro.jpg',
                badge='⭐ Recommandé',
                price_estimate='95 000 FCFA',
                accent_hex='#ec4899',
                features=['Logo Master', 'Carte de visite recto/verso', 'Papier en-tête', 'Signature e-mail HTML']
            ),
            PortfolioItem(
                id='PRT-0004',
                title='Affiche d\'Événement & Cérémonie',
                category='Communication Visuelle',
                description='Affiches captivantes alliant typographie traditionnelle et rigueur moderne.',
                image_url='/images/portfolio/affiche-event.jpg',
                badge='🟢 Populaire',
                price_estimate='35 000 FCFA',
                accent_hex='#fbbf24',
                features=['HD 300 DPI Imprimerie', 'Déclinaisons RS (1:1)', 'Story WhatsApp (16:9)']
            ),
            PortfolioItem(
                id='PRT-0005',
                title='Pack Visuels Réseaux Sociaux',
                category='Communication Visuelle',
                description='Série de visuels captivants et harmonieux pour votre communication digitale.',
                image_url='/images/portfolio/social-media.jpg',
                badge='🟢 Populaire',
                price_estimate='30 000 FCFA',
                accent_hex='#a855f7',
                features=['5 Visuels Carrés 1:1', '5 Stories 16:9', 'Direction artistique unifiée']
            ),
            PortfolioItem(
                id='PRT-0006',
                title='Bâche Événementielle Grand Format XXL',
                category='Grand Format (Bâches)',
                description='Signalétique géante (3x2m, 5x2m) conçue pour l\'impression haute netteté.',
                image_url='/images/portfolio/bache-xxl.jpg',
                badge='📐 Grand Format',
                price_estimate='45 000 FCFA',
                accent_hex='#3b82f6',
                features=['Fichier PDF vectoriel XXL', 'Profil couleur CMJN imprimerie']
            )
        ])

    # Seed Templates if empty
    if Template.objects.count() == 0:
        Template.objects.bulk_create([
            Template(
                id='TPL-0001',
                title='Création de Logo & Charte Graphique',
                category='Identité Visuelle',
                description='Modèle standard pour la création ou refonte de logo d\'entreprise.',
                project_type='Logo',
                technical_format='Vectoriel AI/SVG + PNG HD',
                custom_dimensions='Dimensions standard + Favicon',
                default_main_title='Mon Entreprise - Logo Master',
                default_full_text_content='Création d\'un logo moderne et élégant.',
                style_preferences=['Élégant', 'Moderne', 'Minimaliste'],
                preferred_colors='Or (#f59e0b), Bleu Nuit (#0f172a)',
                avoid_colors='Rouge vif, Vert fluo',
                default_budget_range='50 000 - 100 000 FCFA',
                suggested_price_fcfa=80000,
                usage_count=12
            ),
            Template(
                id='TPL-0002',
                title='Affiche Événementielle Spirituelle / Corporate',
                category='Événementiel',
                description='Modèle optimisé pour Ziarra, Gamou, Magal ou Conférence d\'entreprise.',
                project_type='Affiche',
                technical_format='PDF Imprimerie + PNG Web',
                custom_dimensions='Format A3 / A4 + Story WhatsApp',
                default_main_title='Grande Ziarra Annuelle',
                default_full_text_content='Programme et intervenants de la cérémonie.',
                style_preferences=['Traditionnel', 'Solennel', 'Corporate'],
                preferred_colors='Or Hadara, Vert Émeraude',
                avoid_colors='Couleurs néon',
                default_budget_range='25 000 - 50 000 FCFA',
                suggested_price_fcfa=35000,
                usage_count=8
            ),
            Template(
                id='TPL-0003',
                title='Pack Visuels Réseaux Sociaux (5 Visuels + Stories)',
                category='Social Media',
                description='Campagne de visuels réseaux sociaux prêts à publier.',
                project_type='Pack Réseaux',
                technical_format='PNG HD 1080x1080 & 1080x1920',
                custom_dimensions='1:1 Carré + 16:9 Vertical',
                default_main_title='Lancement Produit / Promotion',
                default_full_text_content='Série de 5 publications avec accroches.',
                style_preferences=['Dynamique', 'Inspirant'],
                preferred_colors='Couleurs de la marque',
                avoid_colors='Noir total',
                default_budget_range='20 000 - 40 000 FCFA',
                suggested_price_fcfa=30000,
                usage_count=15
            ),
            Template(
                id='TPL-0004',
                title='Bâche Signalétique Grand Format XXL',
                category='Grand Format',
                description='Décoration de scène ou bâche d\'accueil événementielle.',
                project_type='Bâche',
                technical_format='PDF CMJN HD',
                custom_dimensions='3x2m ou 5x2m',
                default_main_title='Décor de Scène Officiel',
                default_full_text_content='Titre de l\'événement et logos des partenaires.',
                style_preferences=['Solennel', 'Impactant'],
                preferred_colors='Or, Bleu Sombre',
                avoid_colors='Gris terne',
                default_budget_range='40 000 - 70 000 FCFA',
                suggested_price_fcfa=45000,
                usage_count=5
            )
        ])

    # Seed ToolUsageLogs if empty
    if ToolUsageLog.objects.count() == 0:
        ToolUsageLog.objects.bulk_create([
            ToolUsageLog(tool_name='Agrandisseur HD (Upscale)', ip_address='127.0.0.1', details={'scale': '4x'}),
            ToolUsageLog(tool_name='Nuage de Mots', ip_address='127.0.0.1', details={'words_count': 35}),
            ToolUsageLog(tool_name='Générateur de Factures', ip_address='127.0.0.1', details={'total_fcfa': 150000}),
            ToolUsageLog(tool_name='Détourage IA', ip_address='127.0.0.1', details={'status': 'success'}),
            ToolUsageLog(tool_name='Générateur QR Code', ip_address='127.0.0.1', details={'color': 'gold'}),
            ToolUsageLog(tool_name='OCR Arabe + Français', ip_address='127.0.0.1', details={'chars_extracted': 140}),
        ])

def reverse_seed(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0008_toolusagelog'),
    ]

    operations = [
        migrations.RunPython(seed_portfolio_templates_tools, reverse_seed),
    ]
