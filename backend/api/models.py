from django.db import models

class Brief(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de Création")
    status = models.CharField(max_length=50, default='nouveau', verbose_name="Statut du Projet")
    
    # 1. Client Info
    client_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="Client")
    organization = models.CharField(max_length=200, blank=True, null=True, verbose_name="Organisation / Marque")
    whatsapp = models.CharField(max_length=50, blank=True, null=True, verbose_name="WhatsApp")
    email = models.EmailField(blank=True, null=True, verbose_name="Adresse Email")
    city_country = models.CharField(max_length=200, blank=True, null=True, verbose_name="Ville / Pays")
    
    # 2. Project Type
    project_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="Type de Projet")
    project_type_custom = models.CharField(max_length=200, blank=True, null=True, verbose_name="Type de Projet Personnalisé")
    
    # 3. Context & Objectives
    context_description = models.TextField(blank=True, null=True, verbose_name="Contexte & Description")
    primary_objective = models.TextField(blank=True, null=True, verbose_name="Objectif Principal")
    
    # 4. Target Audience
    target_audience = models.TextField(blank=True, null=True, verbose_name="Cible Visée")
    target_audience_chips = models.JSONField(default=list, verbose_name="Tags Cible")
    
    # 5. Message & Content
    main_title = models.CharField(max_length=200, blank=True, null=True, verbose_name="Titre Principal")
    full_text_content = models.TextField(blank=True, null=True, verbose_name="Textes Inclus")
    
    # 6. Style & Direction
    style_preferences = models.JSONField(default=list, blank=True, null=True, verbose_name="Styles Souhaités")
    preferred_colors = models.CharField(max_length=200, blank=True, null=True, verbose_name="Couleurs Préférées")
    avoid_colors = models.CharField(max_length=200, blank=True, null=True, verbose_name="Couleurs à Éviter")
    
    # 7. Technical Format
    technical_format = models.CharField(max_length=50, blank=True, null=True, verbose_name="Format Technique")
    custom_dimensions = models.CharField(max_length=200, blank=True, null=True, verbose_name="Dimensions Spécifiques")
    usage_type = models.CharField(max_length=20, blank=True, null=True, verbose_name="Type d'Usage")
    
    # 8. Budget & Deadline
    budget_range = models.CharField(max_length=50, blank=True, null=True, verbose_name="Fourchette de Budget")
    desired_delivery_date = models.CharField(max_length=50, blank=True, null=True, verbose_name="Date de Livraison Souhaitée")
    critical_deadline = models.CharField(max_length=50, blank=True, null=True, verbose_name="Délai Critique")
    
    # 9. References & Files
    reference_links = models.TextField(blank=True, null=True, verbose_name="Liens de Référence")
    attachments = models.JSONField(default=list, blank=True, null=True, verbose_name="Pièces Jointes")
    
    # 10. Conditions Validation
    accept_process = models.BooleanField(default=False, blank=True, null=True, verbose_name="Processus Validé")
    accept_deadlines = models.BooleanField(default=False, blank=True, null=True, verbose_name="Délais Validés")
    
    # Admin / Designer fields
    designer_notes = models.TextField(blank=True, null=True, verbose_name="Notes du Designer")
    quoted_price_fcfa = models.IntegerField(blank=True, null=True, verbose_name="Devis Estimé (FCFA)")
    ai_analysis = models.JSONField(blank=True, null=True, verbose_name="Analyse IA Hadara")

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                # Lock the table to prevent race conditions during ID generation
                last_brief = Brief.objects.select_for_update().order_by('-created_at').first()
                if last_brief and (last_brief.id.startswith('HAD-') or last_brief.id.startswith('HDR-')):
                    try:
                        last_id_num = int(last_brief.id.split('-')[1])
                        self.id = f"HAD-{(last_id_num + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "HAD-0001"
                else:
                    self.id = "HAD-0001"
                super().save(*args, **kwargs)  # Dans l'atomic block — rollback si échec
            return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Brief & Projet"
        verbose_name_plural = "Briefs & Projets"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} - {self.client_name}"

class Template(models.Model):
    id = models.CharField(max_length=50, primary_key=True, blank=True)
    title = models.CharField(max_length=200, verbose_name="Titre du modèle")
    category = models.CharField(max_length=100, verbose_name="Catégorie")
    project_type = models.CharField(max_length=50, verbose_name="Type de projet")
    technical_format = models.CharField(max_length=50, verbose_name="Format technique")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    
    # Facultatifs
    custom_dimensions = models.CharField(max_length=200, blank=True, null=True, verbose_name="Dimensions")
    default_main_title = models.CharField(max_length=200, blank=True, null=True, verbose_name="Titre par défaut")
    default_full_text_content = models.TextField(blank=True, null=True, verbose_name="Contenu texte par défaut")
    style_preferences = models.JSONField(default=list, blank=True, null=True, verbose_name="Préférences de style")
    preferred_colors = models.CharField(max_length=200, blank=True, null=True, verbose_name="Couleurs souhaitées")
    avoid_colors = models.CharField(max_length=200, blank=True, null=True, verbose_name="Couleurs à éviter")
    default_budget_range = models.CharField(max_length=50, blank=True, null=True, verbose_name="Fourchette de budget")
    suggested_price_fcfa = models.IntegerField(blank=True, null=True, verbose_name="Prix Indicatif (FCFA)")
    usage_count = models.IntegerField(default=0, verbose_name="Nombre d'utilisations")

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                last_tpl = Template.objects.select_for_update().order_by('-id').first()
                if last_tpl and last_tpl.id.startswith('TPL-'):
                    try:
                        last_num = int(last_tpl.id.split('-')[1])
                        self.id = f"TPL-{(last_num + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "TPL-0001"
                else:
                    self.id = "TPL-0001"
                super().save(*args, **kwargs)
            return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Modèle de Brief"
        verbose_name_plural = "Modèles de Brief"

    def __str__(self):
        return self.title

class PortfolioItem(models.Model):
    id = models.CharField(max_length=50, primary_key=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    title = models.CharField(max_length=200, verbose_name="Titre du projet")
    category = models.CharField(max_length=100, verbose_name="Catégorie")
    image_url = models.TextField(blank=True, null=True, verbose_name="Image du projet (URL ou Upload)")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    badge = models.CharField(max_length=100, blank=True, null=True, verbose_name="Badge Visuel")
    price_estimate = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tarif Indicatif")
    accent_hex = models.CharField(max_length=50, default='#816C07', blank=True, verbose_name="Couleur d'Accent Visuel")
    features = models.JSONField(default=list, blank=True, verbose_name="Livrables Inclus")

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                last_item = PortfolioItem.objects.select_for_update().order_by('-created_at').first()
                if last_item and last_item.id.startswith('PRT-'):
                    try:
                        last_id_num = int(last_item.id.split('-')[1])
                        self.id = f"PRT-{(last_id_num + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "PRT-0001"
                else:
                    self.id = "PRT-0001"
                super().save(*args, **kwargs)  # Dans l'atomic block — rollback si échec
            return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Projet Portfolio"
        verbose_name_plural = "Portfolio"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} - {self.title}"

class StoreProduct(models.Model):
    STATUS_IN_STOCK = 'in_stock'
    STATUS_AVAILABLE_24_48H = 'available_24_48h'
    STATUS_ON_ORDER = 'on_order'
    STATUS_UNAVAILABLE = 'unavailable'

    STATUS_CHOICES = [
        (STATUS_IN_STOCK, 'En stock'),
        (STATUS_AVAILABLE_24_48H, 'Disponible 24-48h'),
        (STATUS_ON_ORDER, 'Sur commande'),
        (STATUS_UNAVAILABLE, 'Indisponible'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=200, verbose_name="Nom du produit")
    brand = models.CharField(max_length=120, blank=True, null=True, verbose_name="Marque")
    category = models.CharField(max_length=100, verbose_name="Catégorie")
    description = models.TextField(verbose_name="Description")
    image = models.TextField(blank=True, null=True, verbose_name="Image")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ON_ORDER, verbose_name="Statut Stock")
    featured = models.BooleanField(default=False, verbose_name="En Vedette")
    visible = models.BooleanField(default=True, verbose_name="Visible en Boutique")
    price = models.PositiveIntegerField(blank=True, null=True, verbose_name="Prix (FCFA)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                last_product = StoreProduct.objects.select_for_update().order_by('-created_at').first()
                if last_product and last_product.id.startswith('PRD-'):
                    try:
                        last_id_num = int(last_product.id.split('-')[1])
                        self.id = f"PRD-{(last_id_num + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "PRD-0001"
                else:
                    self.id = "PRD-0001"
                super().save(*args, **kwargs)
                return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Produit Boutique"
        verbose_name_plural = "Hadara Store (Produits)"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} - {self.name}"

class ToolUsageLog(models.Model):
    tool_name = models.CharField(max_length=100, verbose_name="Nom de l'outil")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'utilisation")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Utilisation d'outil"
        verbose_name_plural = "Statistiques Outils"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tool_name} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"

