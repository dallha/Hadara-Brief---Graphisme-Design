from django.db import models

class Brief(models.Model):
    # UUIDs or String IDs can be used, but since frontend uses "HADARA-YYYY-XXX", we use CharField as primary key or just an ID field.
    id = models.CharField(max_length=50, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='nouveau')
    
    # 1. Client Info
    client_name = models.CharField(max_length=200)
    organization = models.CharField(max_length=200, blank=True, null=True)
    whatsapp = models.CharField(max_length=50)
    email = models.EmailField()
    city_country = models.CharField(max_length=200)
    
    # 2. Project Type
    project_type = models.CharField(max_length=50)
    project_type_custom = models.CharField(max_length=200, blank=True, null=True)
    
    # 3. Context & Objectives
    context_description = models.TextField()
    primary_objective = models.TextField()
    
    # 4. Target Audience
    target_audience = models.TextField()
    target_audience_chips = models.JSONField(default=list)
    
    # 5. Message & Content
    main_title = models.CharField(max_length=200)
    full_text_content = models.TextField()
    
    # 6. Style & Direction
    style_preferences = models.JSONField(default=list)
    preferred_colors = models.CharField(max_length=200)
    avoid_colors = models.CharField(max_length=200)
    
    # 7. Technical Format
    technical_format = models.CharField(max_length=50)
    custom_dimensions = models.CharField(max_length=200, blank=True, null=True)
    usage_type = models.CharField(max_length=20)
    
    # 8. Budget & Deadline
    budget_range = models.CharField(max_length=50)
    desired_delivery_date = models.CharField(max_length=50) # kept as string since TS uses string date format
    critical_deadline = models.CharField(max_length=50, blank=True, null=True)
    
    # 9. References & Files
    reference_links = models.TextField(blank=True, null=True)
    attachments = models.JSONField(default=list)
    
    # 10. Conditions Validation
    accept_process = models.BooleanField(default=False)
    accept_deadlines = models.BooleanField(default=False)
    
    # Admin / Designer fields
    designer_notes = models.TextField(blank=True, null=True)
    quoted_price_fcfa = models.IntegerField(blank=True, null=True)
    ai_analysis = models.JSONField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            import datetime
            year = datetime.datetime.now().year
            count = Brief.objects.filter(id__startswith=f"HADARA-{year}-").count()
            self.id = f"HADARA-{year}-{(count + 1):03d}"
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
