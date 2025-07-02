from django.contrib import admin
from .models import CSRDAssessment, ESRSDataPoint, ComplianceAction, RegulatoryUpdate


@admin.register(CSRDAssessment)
class CSRDAssessmentAdmin(admin.ModelAdmin):
    list_display = ['company', 'status', 'csrd_applicable', 'overall_readiness_score', 'created_at']
    list_filter = ['status', 'csrd_applicable', 'company_size', 'has_eu_operations']
    search_fields = ['company__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Company Information', {
            'fields': ('company', 'created_by', 'company_size', 'has_eu_operations', 
                      'is_listed_company', 'annual_revenue_eur', 'employee_count')
        }),
        ('CSRD Applicability', {
            'fields': ('csrd_applicable', 'first_reporting_year')
        }),
        ('Assessment Status', {
            'fields': ('status', 'overall_readiness_score', 'completed_at')
        }),
        ('AI Analysis Results', {
            'fields': ('gap_analysis', 'priority_actions', 'compliance_timeline', 'ai_recommendations'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(ESRSDataPoint)
class ESRSDataPointAdmin(admin.ModelAdmin):
    list_display = ['datapoint_code', 'datapoint_name', 'esrs_category', 'materiality_level', 'data_availability']
    list_filter = ['esrs_category', 'materiality_level', 'data_availability']
    search_fields = ['datapoint_name', 'datapoint_code']
    
    fieldsets = (
        ('ESRS Classification', {
            'fields': ('assessment', 'esrs_category', 'datapoint_code', 'datapoint_name', 'description')
        }),
        ('Materiality Assessment', {
            'fields': ('materiality_level', 'materiality_justification')
        }),
        ('Data Availability', {
            'fields': ('data_availability', 'data_source', 'data_quality_score')
        }),
        ('Timeline & Responsibility', {
            'fields': ('target_completion_date', 'responsible_person')
        })
    )


@admin.register(ComplianceAction)
class ComplianceActionAdmin(admin.ModelAdmin):
    list_display = ['title', 'priority', 'status', 'assigned_to', 'due_date', 'progress_percentage']
    list_filter = ['priority', 'status', 'assigned_department']
    search_fields = ['title', 'description']
    date_hierarchy = 'due_date'
    
    fieldsets = (
        ('Action Details', {
            'fields': ('assessment', 'related_datapoint', 'title', 'description')
        }),
        ('Priority & Status', {
            'fields': ('priority', 'status', 'progress_percentage')
        }),
        ('Assignment', {
            'fields': ('assigned_to', 'assigned_department')
        }),
        ('Timeline', {
            'fields': ('due_date', 'estimated_hours', 'completed_at')
        }),
        ('Notes', {
            'fields': ('notes',)
        })
    )


@admin.register(RegulatoryUpdate)
class RegulatoryUpdateAdmin(admin.ModelAdmin):
    list_display = ['title', 'update_type', 'impact_level', 'publication_date', 'effective_date']
    list_filter = ['update_type', 'impact_level', 'publication_date']
    search_fields = ['title', 'description']
    date_hierarchy = 'publication_date'
    
    fieldsets = (
        ('Update Information', {
            'fields': ('title', 'description', 'update_type', 'impact_level')
        }),
        ('Source & Dates', {
            'fields': ('source_url', 'publication_date', 'effective_date')
        }),
        ('AI Analysis', {
            'fields': ('ai_impact_analysis', 'affected_datapoints', 'recommended_actions'),
            'classes': ('collapse',)
        }),
        ('Notifications', {
            'fields': ('companies_notified',),
            'classes': ('collapse',)
        })
    )
