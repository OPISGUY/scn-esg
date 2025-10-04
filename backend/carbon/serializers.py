from rest_framework import serializers
from .models import (
    CarbonFootprint, CarbonOffset, OffsetPurchase, 
    ConversationSession, ConversationMessage,
    UploadedDocument, DocumentExtractionField
)
from companies.serializers import CompanySerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class CarbonFootprintSerializer(serializers.ModelSerializer):
    """Serializer for CarbonFootprint model"""
    
    company_data = CompanySerializer(source='company', read_only=True)
    
    class Meta:
        model = CarbonFootprint
        fields = [
            'id', 'company', 'company_data', 'reporting_period',
            'scope1_emissions', 'scope2_emissions', 'scope3_emissions',
            'total_emissions', 'status', 'created_at', 'verified_at'
        ]
        read_only_fields = ['id', 'company', 'total_emissions', 'created_at', 'company_data']


class CarbonOffsetSerializer(serializers.ModelSerializer):
    """Serializer for CarbonOffset model"""
    
    class Meta:
        model = CarbonOffset
        fields = [
            'id', 'name', 'type', 'price_per_tonne', 'co2_offset_per_unit',
            'description', 'image_url', 'available_quantity', 'category',
            'verification_standard', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OffsetPurchaseSerializer(serializers.ModelSerializer):
    """Serializer for OffsetPurchase model"""
    
    company_data = CompanySerializer(source='company', read_only=True)
    offset_data = CarbonOffsetSerializer(source='offset', read_only=True)
    
    class Meta:
        model = OffsetPurchase
        fields = [
            'id', 'company', 'company_data', 'offset', 'offset_data',
            'quantity', 'total_co2_offset', 'total_price', 'purchase_date', 'status'
        ]
        read_only_fields = [
            'id', 'total_co2_offset', 'total_price', 'purchase_date',
            'company_data', 'offset_data'
        ]


class ConversationMessageSerializer(serializers.ModelSerializer):
    """Serializer for ConversationMessage model"""
    
    author_email = serializers.EmailField(source='author.email', read_only=True)
    
    class Meta:
        model = ConversationMessage
        fields = [
            'id', 'session', 'author', 'author_email', 'role', 'content',
            'extracted_data', 'confidence_score', 'validation_status',
            'validated_by', 'validated_at', 'footprint_updated',
            'footprint_changes', 'mentioned_users', 'processing_time_ms',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'author_email']


class ConversationSessionSerializer(serializers.ModelSerializer):
    """Serializer for ConversationSession model"""
    
    company_data = CompanySerializer(source='company', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    messages = ConversationMessageSerializer(many=True, read_only=True, source='conversationmessage_set')
    
    class Meta:
        model = ConversationSession
        fields = [
            'id', 'company', 'company_data', 'footprint', 'created_by',
            'created_by_email', 'participants', 'status', 'session_context',
            'total_emissions_added', 'data_entries_count', 'average_confidence',
            'created_at', 'updated_at', 'messages'
        ]
        read_only_fields = [
            'id', 'total_emissions_added', 'data_entries_count',
            'average_confidence', 'created_at', 'updated_at',
            'company_data', 'created_by_email', 'messages'
        ]


class DocumentExtractionFieldSerializer(serializers.ModelSerializer):
    """Serializer for individual extracted fields from documents"""
    
    class Meta:
        model = DocumentExtractionField
        fields = [
            'id', 'document', 'field_name', 'field_value', 'field_type',
            'confidence', 'bounding_box', 'page_number', 'user_corrected',
            'original_value', 'corrected_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UploadedDocumentSerializer(serializers.ModelSerializer):
    """Serializer for uploaded documents with AI extraction results"""
    
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)
    validated_by_email = serializers.EmailField(source='validated_by.email', read_only=True)
    extracted_fields = DocumentExtractionFieldSerializer(many=True, read_only=True)
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UploadedDocument
        fields = [
            'id', 'company', 'uploaded_by', 'uploaded_by_email',
            'conversation_session', 'file', 'file_url', 'file_name',
            'file_size', 'file_size_display', 'mime_type', 'document_type',
            'extraction_status', 'extracted_data', 'confidence_score',
            'processing_time_ms', 'gemini_model_used', 'extraction_error',
            'user_validated', 'validated_by', 'validated_by_email',
            'validated_at', 'user_corrections', 'applied_to_footprint',
            'footprint', 'conversation_message', 'created_at',
            'updated_at', 'expires_at', 'extracted_fields'
        ]
        read_only_fields = [
            'id', 'file_size', 'uploaded_by_email', 'validated_by_email',
            'extraction_status', 'extracted_data', 'confidence_score',
            'processing_time_ms', 'extraction_error', 'created_at',
            'updated_at', 'expires_at', 'file_size_display',
            'extracted_fields', 'file_url'
        ]
    
    def get_file_url(self, obj):
        """Return full URL for file access"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class UploadedDocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for document list views"""
    
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)
    
    class Meta:
        model = UploadedDocument
        fields = [
            'id', 'file_name', 'document_type', 'extraction_status',
            'confidence_score', 'uploaded_by_email', 'file_size_display',
            'created_at', 'applied_to_footprint'
        ]
        read_only_fields = ['id', 'uploaded_by_email', 'file_size_display', 'created_at']


# ==================== PREDICTION SERIALIZERS (Phase 3) ====================

class PredictionRequestSerializer(serializers.Serializer):
    """Serializer for prediction request parameters"""
    
    company_id = serializers.IntegerField(
        required=True,
        help_text="Company ID for which to make predictions"
    )
    activity_type = serializers.CharField(
        required=True,
        max_length=100,
        help_text="Activity type to predict (e.g., 'electricity', 'natural_gas', 'gasoline')"
    )
    target_period = serializers.DateField(
        required=True,
        help_text="Target date for prediction (YYYY-MM-DD format)"
    )
    footprint_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Optional: Specific footprint ID to use for predictions"
    )
    
    def validate_activity_type(self, value):
        """Ensure activity type is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Activity type cannot be empty")
        return value.strip().lower()


class ConfidenceIntervalSerializer(serializers.Serializer):
    """Serializer for confidence interval bounds"""
    
    lower = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Lower bound of confidence interval"
    )
    upper = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Upper bound of confidence interval"
    )


class PredictionResponseSerializer(serializers.Serializer):
    """Serializer for prediction response data"""
    
    success = serializers.BooleanField(
        help_text="Whether prediction was successful"
    )
    predicted_value = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        allow_null=True,
        help_text="Predicted emissions value for target period"
    )
    confidence_score = serializers.FloatField(
        allow_null=True,
        help_text="Confidence score between 0 and 1"
    )
    confidence_interval = ConfidenceIntervalSerializer(
        allow_null=True,
        help_text="Lower and upper bounds of prediction confidence"
    )
    reasoning = serializers.CharField(
        allow_null=True,
        help_text="Natural language explanation of prediction methodology"
    )
    historical_average = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        allow_null=True,
        help_text="Historical average baseline value"
    )
    seasonal_factor = serializers.FloatField(
        allow_null=True,
        help_text="Seasonal adjustment factor applied"
    )
    growth_factor = serializers.FloatField(
        allow_null=True,
        help_text="Growth trend adjustment factor applied"
    )
    data_points_used = serializers.IntegerField(
        allow_null=True,
        help_text="Number of historical data points used"
    )
    message = serializers.CharField(
        allow_null=True,
        help_text="Status or error message"
    )


class MonthlyFactorSerializer(serializers.Serializer):
    """Serializer for monthly seasonal factors"""
    
    month = serializers.IntegerField(
        min_value=1,
        max_value=12,
        help_text="Month number (1-12)"
    )
    month_name = serializers.CharField(
        help_text="Month name (e.g., 'January')"
    )
    factor = serializers.FloatField(
        help_text="Seasonal adjustment factor for this month"
    )
    average_value = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        allow_null=True,
        help_text="Average emissions value for this month historically"
    )


class SeasonalPatternSerializer(serializers.Serializer):
    """Serializer for seasonal pattern analysis results"""
    
    success = serializers.BooleanField(
        help_text="Whether seasonal analysis was successful"
    )
    pattern_detected = serializers.BooleanField(
        help_text="Whether seasonal patterns were detected"
    )
    pattern_description = serializers.CharField(
        allow_null=True,
        help_text="Natural language description of seasonal patterns"
    )
    monthly_factors = MonthlyFactorSerializer(
        many=True,
        allow_null=True,
        help_text="Seasonal adjustment factors for each month"
    )
    peak_month = serializers.CharField(
        allow_null=True,
        help_text="Month with highest emissions"
    )
    low_month = serializers.CharField(
        allow_null=True,
        help_text="Month with lowest emissions"
    )
    pattern_strength = serializers.FloatField(
        allow_null=True,
        help_text="Strength of seasonal pattern (0-1 scale)"
    )
    data_points_analyzed = serializers.IntegerField(
        allow_null=True,
        help_text="Number of historical data points analyzed"
    )
    message = serializers.CharField(
        allow_null=True,
        help_text="Status or error message"
    )


class MonthlyGrowthSerializer(serializers.Serializer):
    """Serializer for monthly growth rate data"""
    
    month = serializers.CharField(
        help_text="Month identifier (YYYY-MM format)"
    )
    growth_rate = serializers.FloatField(
        help_text="Month-over-month growth rate"
    )


class GrowthTrendSerializer(serializers.Serializer):
    """Serializer for growth trend analysis results"""
    
    success = serializers.BooleanField(
        help_text="Whether growth analysis was successful"
    )
    annual_growth_rate = serializers.FloatField(
        allow_null=True,
        help_text="Annualized growth rate as percentage"
    )
    trend_direction = serializers.CharField(
        allow_null=True,
        help_text="Trend direction: 'increasing', 'decreasing', or 'stable'"
    )
    trend_significance = serializers.FloatField(
        allow_null=True,
        help_text="Statistical significance of trend (0-1 scale)"
    )
    trend_confidence = serializers.FloatField(
        allow_null=True,
        help_text="Confidence in trend direction (0-1 scale)"
    )
    monthly_growth_rates = MonthlyGrowthSerializer(
        many=True,
        allow_null=True,
        help_text="Month-by-month growth rates"
    )
    reasoning = serializers.CharField(
        allow_null=True,
        help_text="Natural language explanation of trend analysis"
    )
    data_points_analyzed = serializers.IntegerField(
        allow_null=True,
        help_text="Number of historical data points analyzed"
    )
    message = serializers.CharField(
        allow_null=True,
        help_text="Status or error message"
    )
