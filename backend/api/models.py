from django.db import models

class Brief(models.Model):
    # UUIDs or String IDs can be used, but since frontend uses "HADARA-YYYY-XXX", we use CharField as primary key or just an ID field.
    id = models.CharField(max_length=50, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='nouveau')
    
    # 1. Client Info
    client_name = models.CharField(max_length=200, blank=True, null=True)
    organization = models.CharField(max_length=200, blank=True, null=True)
    whatsapp = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    city_country = models.CharField(max_length=200, blank=True, null=True)
    
    # 2. Project Type
    project_type = models.CharField(max_length=50, blank=True, null=True)
    project_type_custom = models.CharField(max_length=200, blank=True, null=True)
    
    # 3. Context & Objectives
    context_description = models.TextField(blank=True, null=True)
    primary_objective = models.TextField(blank=True, null=True)
    
    # 4. Target Audience
    target_audience = models.TextField(blank=True, null=True)
    target_audience_chips = models.JSONField(default=list)
    
    # 5. Message & Content
    main_title = models.CharField(max_length=200, blank=True, null=True)
    full_text_content = models.TextField(blank=True, null=True)
    
    # 6. Style & Direction
    style_preferences = models.JSONField(default=list, blank=True, null=True)
    preferred_colors = models.CharField(max_length=200, blank=True, null=True)
    avoid_colors = models.CharField(max_length=200, blank=True, null=True)
    
    # 7. Technical Format
    technical_format = models.CharField(max_length=50, blank=True, null=True)
    custom_dimensions = models.CharField(max_length=200, blank=True, null=True)
    usage_type = models.CharField(max_length=20, blank=True, null=True)
    
    # 8. Budget & Deadline
    budget_range = models.CharField(max_length=50, blank=True, null=True)
    desired_delivery_date = models.CharField(max_length=50, blank=True, null=True) # kept as string since TS uses string date format
    critical_deadline = models.CharField(max_length=50, blank=True, null=True)
    
    # 9. References & Files
    reference_links = models.TextField(blank=True, null=True)
    attachments = models.JSONField(default=list, blank=True, null=True)
    
    # 10. Conditions Validation
    accept_process = models.BooleanField(default=False, blank=True, null=True)
    accept_deadlines = models.BooleanField(default=False, blank=True, null=True)
    
    # Admin / Designer fields
    designer_notes = models.TextField(blank=True, null=True)
    quoted_price_fcfa = models.IntegerField(blank=True, null=True)
    ai_analysis = models.JSONField(blank=True, null=True)

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

    def __str__(self):
        return f"{self.id} - {self.client_name}"

class Template(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField()
    project_type = models.CharField(max_length=50)
    technical_format = models.CharField(max_length=50)
    custom_dimensions = models.CharField(max_length=200, blank=True, null=True)
    default_main_title = models.CharField(max_length=200)
    default_full_text_content = models.TextField()
    style_preferences = models.JSONField(default=list)
    preferred_colors = models.CharField(max_length=200)
    avoid_colors = models.CharField(max_length=200)
    default_budget_range = models.CharField(max_length=50)
    suggested_price_fcfa = models.IntegerField()
    usage_count = models.IntegerField(default=0)

    def __str__(self):
        return self.title

class PortfolioItem(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField()
    image_url = models.TextField(blank=True, null=True)
    badge = models.CharField(max_length=100, blank=True, null=True)
    price_estimate = models.CharField(max_length=100, blank=True, null=True)
    accent_hex = models.CharField(max_length=50, default='#816C07')
    features = models.JSONField(default=list)

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
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=120, blank=True, null=True)
    category = models.CharField(max_length=100)
    description = models.TextField()
    image = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ON_ORDER)
    featured = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)
    price = models.PositiveIntegerField(blank=True, null=True)
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

