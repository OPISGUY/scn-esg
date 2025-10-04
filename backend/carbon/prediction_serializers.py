"""
Phase 3: Prediction API Serializers
Request/response serializers for prediction endpoints.
"""

from rest_framework import serializers
from django.core.validators import MinValueValidator


class PredictNextValueRequestSerializer(serializers.Serializer):
    """Request serializer for predict next value endpoint."""
    
    company_id = serializers.UUIDField(
        required=True,
        help_text="UUID of the company"
    )
    activity_type = serializers.ChoiceField(
        required=True,
        choices=[
            'electricity',
            'natural_gas',
            'gasoline',
            'diesel',
            'fuel_oil',
            'business_travel',
            'commuting',
            'purchased_goods',
        ],
        help_text="Type of activity to predict"
    )
    target_period = serializers.RegexField(
        regex=r'^\d{4}-\d{2}$',
        required=True,
        help_text="Target period in YYYY-MM format"
    )


class ConfidenceIntervalSerializer(serializers.Serializer):
    """Confidence interval for predictions."""
    
    lower = serializers.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Lower bound of confidence interval"
    )
    upper = serializers.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Upper bound of confidence interval"
    )


class PredictNextValueResponseSerializer(serializers.Serializer):
    """Response serializer for predict next value endpoint."""
    
    success = serializers.BooleanField()
    predicted_value = serializers.FloatField(
        allow_null=True,
        help_text="Predicted value for target period"
    )
    confidence = serializers.FloatField(
        min_value=0.0,
        max_value=1.0,
        help_text="Confidence score (0-1)"
    )
    confidence_interval = ConfidenceIntervalSerializer(
        required=False,
        help_text="Confidence interval bounds"
    )
    prediction_method = serializers.CharField(
        required=False,
        help_text="Method used for prediction"
    )
    reasoning = serializers.CharField(
        required=False,
        help_text="Human-readable explanation"
    )
    historical_avg = serializers.FloatField(
        required=False,
        help_text="Historical average value"
    )
    seasonal_factor = serializers.FloatField(
        required=False,
        help_text="Seasonal adjustment factor"
    )
    growth_factor = serializers.FloatField(
        required=False,
        help_text="Growth trend factor"
    )
    data_points_used = serializers.IntegerField(
        required=False,
        help_text="Number of historical data points used"
    )
    message = serializers.CharField(
        required=False,
        help_text="Message when insufficient data"
    )
    suggestion = serializers.CharField(
        required=False,
        help_text="Suggestion for user action"
    )
    error = serializers.CharField(
        required=False,
        help_text="Error message if failed"
    )


class DetectSeasonalPatternsRequestSerializer(serializers.Serializer):
    """Request serializer for seasonal pattern detection."""
    
    company_id = serializers.UUIDField(
        required=True,
        help_text="UUID of the company"
    )
    activity_type = serializers.ChoiceField(
        required=True,
        choices=[
            'electricity',
            'natural_gas',
            'gasoline',
            'diesel',
            'fuel_oil',
            'business_travel',
            'commuting',
            'purchased_goods',
        ],
        help_text="Type of activity to analyze"
    )


class DetectSeasonalPatternsResponseSerializer(serializers.Serializer):
    """Response serializer for seasonal pattern detection."""
    
    success = serializers.BooleanField()
    has_seasonal_pattern = serializers.BooleanField(
        required=False,
        help_text="Whether significant seasonal pattern detected"
    )
    peak_months = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=12),
        required=False,
        help_text="Months with highest usage (1-12)"
    )
    low_months = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=12),
        required=False,
        help_text="Months with lowest usage (1-12)"
    )
    monthly_factors = serializers.DictField(
        child=serializers.FloatField(),
        required=False,
        help_text="Monthly adjustment factors (month: factor)"
    )
    pattern_strength = serializers.FloatField(
        min_value=0.0,
        max_value=1.0,
        required=False,
        help_text="Strength of seasonal pattern (0-1)"
    )
    pattern_description = serializers.CharField(
        required=False,
        help_text="Human-readable pattern description"
    )
    data_points_analyzed = serializers.IntegerField(
        required=False,
        help_text="Number of data points analyzed"
    )
    message = serializers.CharField(
        required=False,
        help_text="Message when insufficient data"
    )
    error = serializers.CharField(
        required=False,
        help_text="Error message if failed"
    )


class CalculateGrowthTrendRequestSerializer(serializers.Serializer):
    """Request serializer for growth trend calculation."""
    
    company_id = serializers.UUIDField(
        required=True,
        help_text="UUID of the company"
    )
    activity_type = serializers.ChoiceField(
        required=False,
        allow_null=True,
        choices=[
            'electricity',
            'natural_gas',
            'gasoline',
            'diesel',
            'fuel_oil',
            'business_travel',
            'commuting',
            'purchased_goods',
        ],
        help_text="Type of activity (null = total emissions)"
    )


class CalculateGrowthTrendResponseSerializer(serializers.Serializer):
    """Response serializer for growth trend calculation."""
    
    success = serializers.BooleanField()
    growth_rate = serializers.FloatField(
        required=False,
        help_text="Annual growth rate as decimal (0.05 = 5%)"
    )
    trend_direction = serializers.ChoiceField(
        choices=['increasing', 'decreasing', 'stable', 'unknown'],
        required=False,
        help_text="Direction of trend"
    )
    is_significant = serializers.BooleanField(
        required=False,
        help_text="Whether trend is statistically significant"
    )
    confidence = serializers.FloatField(
        min_value=0.0,
        max_value=1.0,
        required=False,
        help_text="Confidence in trend (0-1)"
    )
    reasoning = serializers.CharField(
        required=False,
        help_text="Human-readable explanation"
    )
    monthly_growth_rates = serializers.ListField(
        child=serializers.FloatField(),
        required=False,
        help_text="Month-over-month growth rates"
    )
    data_points_analyzed = serializers.IntegerField(
        required=False,
        help_text="Number of data points analyzed"
    )
    message = serializers.CharField(
        required=False,
        help_text="Message when insufficient data"
    )
    error = serializers.CharField(
        required=False,
        help_text="Error message if failed"
    )
