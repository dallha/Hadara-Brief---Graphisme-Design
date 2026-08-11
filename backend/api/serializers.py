from rest_framework import serializers
from .models import (
    Brief, Template, PortfolioItem, StoreProduct,
    Client, BillingDocument, BillingLine, Payment
)

class BriefSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    clientName = serializers.CharField(source='client_name')
    organization = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    whatsapp = serializers.CharField()
    email = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    cityCountry = serializers.CharField(source='city_country', required=False, allow_blank=True)
    projectType = serializers.CharField(source='project_type', required=False, allow_blank=True)
    projectTypeCustom = serializers.CharField(source='project_type_custom', required=False, allow_null=True, allow_blank=True)
    contextDescription = serializers.CharField(source='context_description', required=False, allow_blank=True)
    primaryObjective = serializers.CharField(source='primary_objective', required=False, allow_blank=True)
    targetAudience = serializers.CharField(source='target_audience', required=False, allow_blank=True)
    targetAudienceChips = serializers.JSONField(source='target_audience_chips', required=False)
    mainTitle = serializers.CharField(source='main_title', required=False, allow_blank=True)
    fullTextContent = serializers.CharField(source='full_text_content', required=False, allow_blank=True)
    stylePreferences = serializers.JSONField(source='style_preferences', required=False)
    preferredColors = serializers.CharField(source='preferred_colors', required=False, allow_blank=True)
    avoidColors = serializers.CharField(source='avoid_colors', required=False, allow_blank=True)
    technicalFormat = serializers.CharField(source='technical_format', required=False, allow_blank=True)
    customDimensions = serializers.CharField(source='custom_dimensions', required=False, allow_null=True, allow_blank=True)
    usageType = serializers.CharField(source='usage_type', required=False, allow_blank=True)
    budgetRange = serializers.CharField(source='budget_range', required=False, allow_blank=True)
    desiredDeliveryDate = serializers.CharField(source='desired_delivery_date', required=False, allow_blank=True)
    criticalDeadline = serializers.CharField(source='critical_deadline', required=False, allow_null=True, allow_blank=True)
    referenceLinks = serializers.CharField(source='reference_links', required=False, allow_null=True, allow_blank=True)
    attachments = serializers.JSONField(required=False)
    acceptProcess = serializers.BooleanField(source='accept_process', required=False)
    acceptDeadlines = serializers.BooleanField(source='accept_deadlines', required=False)
    designerNotes = serializers.CharField(source='designer_notes', required=False, allow_null=True, allow_blank=True)
    quotedPriceFCFA = serializers.IntegerField(source='quoted_price_fcfa', required=False, allow_null=True)
    aiAnalysis = serializers.JSONField(source='ai_analysis', required=False, allow_null=True)
    deliverableVersions = serializers.JSONField(source='deliverable_versions', required=False, allow_null=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), source='client', required=False, allow_null=True, write_only=False
    )
    clientDetails = serializers.SerializerMethodField()

    class Meta:
        model = Brief
        fields = [
            'id', 'createdAt', 'status', 'clientName', 'organization', 'whatsapp', 'email', 'cityCountry',
            'projectType', 'projectTypeCustom', 'contextDescription', 'primaryObjective', 'targetAudience',
            'targetAudienceChips', 'mainTitle', 'fullTextContent', 'stylePreferences', 'preferredColors',
            'avoidColors', 'technicalFormat', 'customDimensions', 'usageType', 'budgetRange', 'desiredDeliveryDate',
            'criticalDeadline', 'referenceLinks', 'attachments', 'acceptProcess', 'acceptDeadlines',
            'designerNotes', 'quotedPriceFCFA', 'aiAnalysis', 'deliverableVersions', 'client_id', 'clientDetails'
        ]

    def get_clientDetails(self, obj):
        if obj.client:
            return ClientSerializer(obj.client).data
        return None

class TemplateSerializer(serializers.ModelSerializer):
    projectType = serializers.CharField(source='project_type')
    technicalFormat = serializers.CharField(source='technical_format')
    customDimensions = serializers.CharField(source='custom_dimensions', required=False, allow_null=True)
    defaultMainTitle = serializers.CharField(source='default_main_title')
    defaultFullTextContent = serializers.CharField(source='default_full_text_content')
    stylePreferences = serializers.JSONField(source='style_preferences')
    preferredColors = serializers.CharField(source='preferred_colors')
    avoidColors = serializers.CharField(source='avoid_colors')
    defaultBudgetRange = serializers.CharField(source='default_budget_range')
    suggestedPriceFCFA = serializers.IntegerField(source='suggested_price_fcfa')
    usageCount = serializers.IntegerField(source='usage_count', read_only=True)

    class Meta:
        model = Template
        fields = [
            'id', 'title', 'category', 'description', 'projectType', 'technicalFormat',
            'customDimensions', 'defaultMainTitle', 'defaultFullTextContent', 'stylePreferences',
            'preferredColors', 'avoidColors', 'defaultBudgetRange', 'suggestedPriceFCFA', 'usageCount'
        ]

class PortfolioItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    imageUrl = serializers.CharField(source='image_url', required=False, allow_null=True, allow_blank=True)
    priceEstimate = serializers.CharField(source='price_estimate', required=False, allow_null=True, allow_blank=True)
    accentHex = serializers.CharField(source='accent_hex', required=False, allow_blank=True)

    class Meta:
        model = PortfolioItem
        fields = [
            'id', 'createdAt', 'title', 'category', 'description', 'imageUrl',
            'badge', 'priceEstimate', 'accentHex', 'features'
        ]

class StoreProductSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    image = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    brand = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    price = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = StoreProduct
        fields = [
            'id', 'name', 'brand', 'category', 'description', 'image', 'status',
            'featured', 'visible', 'price', 'created_at', 'updated_at', 'createdAt', 'updatedAt'
        ]


# ──────────────────────────────────────────────
# Billing serializers
# ──────────────────────────────────────────────

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class BillingLineSerializer(serializers.ModelSerializer):
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = BillingLine
        fields = ['id', 'designation', 'quantity', 'unit_price', 'line_total']

    def get_line_total(self, obj):
        return obj.line_total


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'method', 'method_display',
            'reference_code', 'payment_date', 'note', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class BillingDocumentSerializer(serializers.ModelSerializer):
    lines = BillingLineSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    paid_amount = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True, default='')

    class Meta:
        model = BillingDocument
        fields = [
            'id', 'document_number', 'doc_type', 'doc_type_display',
            'payment_status', 'payment_status_display',
            'client', 'client_name', 'brief',
            'billing_client_name', 'billing_organization', 'billing_address',
            'billing_email', 'billing_whatsapp',
            'subtotal', 'discount', 'total', 'currency',
            'issue_date', 'due_date', 'notes',
            'paid_amount', 'balance_due',
            'lines', 'payments',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'document_number', 'total',
            'issue_date', 'created_at', 'updated_at',
        ]

    def get_paid_amount(self, obj):
        return obj.paid_amount

    def get_balance_due(self, obj):
        return obj.balance_due
