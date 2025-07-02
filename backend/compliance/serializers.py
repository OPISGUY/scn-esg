from rest_framework import serializers
from .models import CSRDAssessment, ESRSDataPoint, ComplianceAction, RegulatoryUpdate, ESRSDatapointCatalog


class ESRSDataPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = ESRSDataPoint
        fields = [
            'id', 'esrs_category', 'datapoint_code', 'datapoint_name',
            'description', 'materiality_level', 'materiality_justification',
            'data_availability', 'data_source', 'data_quality_score',
            'target_completion_date', 'responsible_person',
            'created_at', 'updated_at'
        ]


class ComplianceActionSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    related_datapoint_name = serializers.CharField(source='related_datapoint.datapoint_name', read_only=True)
    
    class Meta:
        model = ComplianceAction
        fields = [
            'id', 'title', 'description', 'priority', 'status',
            'due_date', 'estimated_hours', 'assigned_to', 'assigned_to_name',
            'assigned_department', 'progress_percentage', 'notes',
            'related_datapoint', 'related_datapoint_name',
            'created_at', 'updated_at', 'completed_at'
        ]


class CSRDAssessmentSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    esrs_datapoints = ESRSDataPointSerializer(many=True, read_only=True)
    compliance_actions = ComplianceActionSerializer(many=True, read_only=True)
    
    # Calculated fields
    total_datapoints = serializers.SerializerMethodField()
    completed_datapoints = serializers.SerializerMethodField()
    high_priority_actions = serializers.SerializerMethodField()
    
    class Meta:
        model = CSRDAssessment
        fields = [
            'id', 'company', 'company_name', 'created_by', 'created_by_name',
            'company_size', 'has_eu_operations', 'is_listed_company',
            'annual_revenue_eur', 'employee_count', 'csrd_applicable',
            'first_reporting_year', 'status', 'overall_readiness_score',
            'gap_analysis', 'priority_actions', 'compliance_timeline',
            'ai_recommendations', 'esrs_datapoints', 'compliance_actions',
            'total_datapoints', 'completed_datapoints', 'high_priority_actions',
            'created_at', 'updated_at', 'completed_at'
        ]
    
    def get_total_datapoints(self, obj):
        return obj.esrs_datapoints.count()
    
    def get_completed_datapoints(self, obj):
        return obj.esrs_datapoints.filter(data_availability='available').count()
    
    def get_high_priority_actions(self, obj):
        return obj.compliance_actions.filter(priority__in=['critical', 'high'], status__in=['pending', 'in_progress']).count()


class CSRDAssessmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CSRDAssessment
        fields = [
            'company', 'company_size', 'has_eu_operations', 'is_listed_company',
            'annual_revenue_eur', 'employee_count'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        
        # Determine CSRD applicability
        company_size = validated_data.get('company_size')
        has_eu_operations = validated_data.get('has_eu_operations', False)
        is_listed = validated_data.get('is_listed_company', False)
        revenue = validated_data.get('annual_revenue_eur', 0)
        employees = validated_data.get('employee_count', 0)
        
        # CSRD applicability logic
        csrd_applicable = False
        first_reporting_year = None
        
        if is_listed:
            csrd_applicable = True
            first_reporting_year = 2025  # Listed companies start 2025
        elif company_size == 'large' and has_eu_operations:
            csrd_applicable = True
            first_reporting_year = 2026  # Large non-listed start 2026
        elif company_size in ['medium', 'small'] and has_eu_operations:
            if revenue >= 40000000:  # €40M threshold
                csrd_applicable = True
                first_reporting_year = 2027  # SMEs start 2027
        
        validated_data['csrd_applicable'] = csrd_applicable
        validated_data['first_reporting_year'] = first_reporting_year
        
        return super().create(validated_data)


class RegulatoryUpdateSerializer(serializers.ModelSerializer):
    companies_notified_count = serializers.SerializerMethodField()
    
    class Meta:
        model = RegulatoryUpdate
        fields = [
            'id', 'title', 'description', 'update_type', 'impact_level',
            'source_url', 'publication_date', 'effective_date',
            'ai_impact_analysis', 'affected_datapoints', 'recommended_actions',
            'companies_notified_count', 'created_at', 'updated_at'
        ]
    
    def get_companies_notified_count(self, obj):
        return obj.companies_notified.count()


class ESRSDatapointCatalogSerializer(serializers.ModelSerializer):
    hierarchy_path = serializers.ReadOnlyField()
    
    class Meta:
        model = ESRSDatapointCatalog
        fields = [
            'id', 'code', 'name', 'description', 'standard', 'section',
            'disclosure_requirement', 'category', 'data_type', 'unit',
            'mandatory', 'ai_guidance', 'hierarchy_path', 'created_at', 'updated_at'
        ]
