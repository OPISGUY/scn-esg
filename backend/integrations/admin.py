from django.contrib import admin
from .models import (
    IntegrationProvider,
    IntegrationConnection,
    IntegrationSyncLog,
    WebhookEndpoint,
    IntegrationDataMapping
)


@admin.register(IntegrationProvider)
class IntegrationProviderAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'category', 'auth_method', 'is_active', 'is_beta']
    list_filter = ['category', 'auth_method', 'is_active', 'is_beta']
    search_fields = ['name', 'display_name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(IntegrationConnection)
class IntegrationConnectionAdmin(admin.ModelAdmin):
    list_display = ['user', 'provider', 'status', 'auto_sync_enabled', 'last_sync_at', 'created_at']
    list_filter = ['status', 'auto_sync_enabled', 'provider__category']
    search_fields = ['user__email', 'provider__display_name', 'connection_name']
    readonly_fields = ['created_at', 'updated_at', 'last_sync_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'provider', 'company', 'connection_name', 'status')
        }),
        ('Sync Configuration', {
            'fields': ('auto_sync_enabled', 'sync_frequency_minutes', 'last_sync_at', 'next_sync_at')
        }),
        ('External Account', {
            'fields': ('external_account_id', 'external_account_name')
        }),
        ('Advanced', {
            'fields': ('data_mappings', 'sync_filters', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(IntegrationSyncLog)
class IntegrationSyncLogAdmin(admin.ModelAdmin):
    list_display = ['connection', 'status', 'sync_type', 'records_processed', 'started_at', 'duration_seconds']
    list_filter = ['status', 'sync_type', 'started_at']
    search_fields = ['connection__user__email', 'connection__provider__display_name']
    readonly_fields = ['started_at', 'completed_at', 'duration_seconds']
    
    fieldsets = (
        ('Connection', {
            'fields': ('connection', 'status', 'sync_type')
        }),
        ('Results', {
            'fields': ('records_fetched', 'records_processed', 'records_created', 'records_updated', 'records_failed')
        }),
        ('Timing', {
            'fields': ('started_at', 'completed_at', 'duration_seconds')
        }),
        ('Errors', {
            'fields': ('error_message', 'error_details'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WebhookEndpoint)
class WebhookEndpointAdmin(admin.ModelAdmin):
    list_display = ['connection', 'event_type', 'is_active', 'total_events_received', 'last_received_at']
    list_filter = ['is_active', 'event_type']
    search_fields = ['connection__user__email', 'connection__provider__display_name', 'event_type']
    readonly_fields = ['created_at', 'updated_at', 'last_received_at', 'total_events_received']


@admin.register(IntegrationDataMapping)
class IntegrationDataMappingAdmin(admin.ModelAdmin):
    list_display = ['provider', 'data_type', 'external_object_type', 'is_default', 'is_active']
    list_filter = ['data_type', 'is_default', 'is_active']
    search_fields = ['provider__display_name', 'external_object_type']
    readonly_fields = ['created_at', 'updated_at']
