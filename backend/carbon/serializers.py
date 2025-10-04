from rest_framework import serializers
from .models import CarbonFootprint, CarbonOffset, OffsetPurchase
from companies.serializers import CompanySerializer


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
