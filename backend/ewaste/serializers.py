from rest_framework import serializers
from .models import EwasteEntry
from companies.serializers import CompanySerializer


class EwasteEntrySerializer(serializers.ModelSerializer):
    """Serializer for EwasteEntry model"""
    
    company_data = CompanySerializer(source='company', read_only=True)
    device_type_display = serializers.CharField(source='get_device_type_display', read_only=True)
    
    class Meta:
        model = EwasteEntry
        fields = [
            'id', 'company', 'company_data', 'device_type', 'device_type_display',
            'quantity', 'weight_kg', 'donation_date', 'estimated_co2_saved',
            'carbon_credits_generated', 'status', 'created_at'
        ]
        read_only_fields = [
            'id', 'estimated_co2_saved', 'carbon_credits_generated',
            'created_at', 'company_data', 'device_type_display'
        ]
