from rest_framework import serializers
from .models import Brief, Template

class BriefSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    clientName = serializers.CharField(source='client_name')
    cityCountry = serializers.CharField(source='city_country')
    projectType = serializers.CharField(source='project_type')
    projectTypeCustom = serializers.CharField(source='project_type_custom', required=False, allow_null=True)
    contextDescription = serializers.CharField(source='context_description')
    primaryObjective = serializers.CharField(source='primary_objective')
    targetAudience = serializers.CharField(source='target_audience')
    targetAudienceChips = serializers.JSONField(source='target_audience_chips')
    mainTitle = serializers.CharField(source='main_title')
    fullTextContent = serializers.CharField(source='full_text_content')
    stylePreferences = serializers.JSONField(source='style_preferences')
    preferredColors = serializers.CharField(source='preferred_colors')
    avoidColors = serializers.CharField(source='avoid_colors')
    technicalFormat = serializers.CharField(source='technical_format')
    customDimensions = serializers.CharField(source='custom_dimensions', required=False, allow_null=True)
    usageType = serializers.CharField(source='usage_type')
    budgetRange = serializers.CharField(source='budget_range')
    desiredDeliveryDate = serializers.CharField(source='desired_delivery_date')
    criticalDeadline = serializers.CharField(source='critical_deadline', required=False, allow_null=True)
    referenceLinks = serializers.CharField(source='reference_links', required=False, allow_null=True)
    acceptProcess = serializers.BooleanField(source='accept_process')
    acceptDeadlines = serializers.BooleanField(source='accept_deadlines')
    designerNotes = serializers.CharField(source='designer_notes', required=False, allow_null=True)
    quotedPriceFCFA = serializers.IntegerField(source='quoted_price_fcfa', required=False, allow_null=True)
    aiAnalysis = serializers.JSONField(source='ai_analysis', required=False, allow_null=True)

    class Meta:
        model = Brief
        fields = [
            'id', 'createdAt', 'status', 'clientName', 'organization', 'whatsapp', 'email', 'cityCountry',
            'projectType', 'projectTypeCustom', 'contextDescription', 'primaryObjective', 'targetAudience',
            'targetAudienceChips', 'mainTitle', 'fullTextContent', 'stylePreferences', 'preferredColors',
            'avoidColors', 'technicalFormat', 'customDimensions', 'usageType', 'budgetRange', 'desiredDeliveryDate',
            'criticalDeadline', 'referenceLinks', 'attachments', 'acceptProcess', 'acceptDeadlines',
            'designerNotes', 'quotedPriceFCFA', 'aiAnalysis'
        ]

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
