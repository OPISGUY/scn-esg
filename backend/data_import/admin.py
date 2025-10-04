from django.contrib import admin
from .models import ImportSource, ImportJob, ImportFieldMapping, ImportedRecord


@admin.register(ImportSource)
class ImportSourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'source_type', 'is_active', 'created_at']
    list_filter = ['source_type', 'is_active']
    search_fields = ['name', 'description']


@admin.register(ImportJob)
class ImportJobAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'data_type', 'status', 'progress_percentage', 'created_at']
    list_filter = ['status', 'data_type', 'created_at']
    search_fields = ['name', 'user__email']
    readonly_fields = ['progress_percentage', 'success_rate', 'created_at', 'started_at', 'completed_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'user', 'company', 'source', 'data_type', 'status')
        }),
        ('File Information', {
            'fields': ('file', 'file_name', 'file_size', 'file_type')
        }),
        ('Progress', {
            'fields': ('total_rows', 'processed_rows', 'successful_rows', 'failed_rows', 
                      'progress_percentage', 'success_rate')
        }),
        ('Configuration', {
            'fields': ('field_mapping', 'import_settings'),
            'classes': ('collapse',)
        }),
        ('Errors', {
            'fields': ('validation_errors', 'import_errors'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'started_at', 'completed_at')
        }),
    )


@admin.register(ImportFieldMapping)
class ImportFieldMappingAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'data_type', 'is_default', 'use_count', 'created_at']
    list_filter = ['data_type', 'is_default']
    search_fields = ['name', 'user__email']
    readonly_fields = ['use_count', 'created_at', 'updated_at']


@admin.register(ImportedRecord)
class ImportedRecordAdmin(admin.ModelAdmin):
    list_display = ['job', 'row_number', 'is_successful', 'imported_at']
    list_filter = ['is_successful', 'imported_at']
    search_fields = ['job__name', 'error_message']
    readonly_fields = ['imported_at']
