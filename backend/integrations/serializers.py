"""
Serializers for integrations API
"""
from rest_framework import serializers
from .models import (
    IntegrationProvider,
    IntegrationConnection,
    IntegrationSyncLog,
    WebhookEndpoint,
    IntegrationDataMapping
)


class IntegrationProviderSerializer(serializers.ModelSerializer):
    """Serializer for integration providers"""
    
    class Meta:
        model = IntegrationProvider
        fields = [
            'id', 'name', 'display_name', 'category', 'description',
            'logo_url', 'website_url', 'auth_method', 'is_active',
            'is_beta', 'supports_webhooks', 'supports_real_time_sync',
            'documentation_url'
        ]
        read_only_fields = ['id']


class IntegrationConnectionSerializer(serializers.ModelSerializer):
    """Serializer for integration connections"""
    provider_details = IntegrationProviderSerializer(source='provider', read_only=True)
    is_token_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = IntegrationConnection
        fields = [
            'id', 'provider', 'provider_details', 'connection_name',
            'status', 'auto_sync_enabled', 'sync_frequency_minutes',
            'last_sync_at', 'next_sync_at', 'external_account_name',
            'created_at', 'updated_at', 'is_token_expired', 'error_message'
        ]
        read_only_fields = [
            'id', 'last_sync_at', 'next_sync_at', 'created_at',
            'updated_at', 'external_account_name'
        ]
        extra_kwargs = {
            'encrypted_credentials': {'write_only': True},
        }
    
    def get_is_token_expired(self, obj):
        return obj.is_token_expired()


class IntegrationConnectionCreateSerializer(serializers.Serializer):
    """Serializer for creating new integration connections"""
    provider_id = serializers.UUIDField()
    connection_name = serializers.CharField(max_length=200)
    auth_code = serializers.CharField(required=False, allow_blank=True)
    api_key = serializers.CharField(required=False, allow_blank=True)
    redirect_uri = serializers.URLField(required=False)


class IntegrationSyncLogSerializer(serializers.ModelSerializer):
    """Serializer for sync logs"""
    provider_name = serializers.CharField(source='connection.provider.display_name', read_only=True)
    
    class Meta:
        model = IntegrationSyncLog
        fields = [
            'id', 'connection', 'provider_name', 'status', 'sync_type',
            'records_fetched', 'records_processed', 'records_created',
            'records_updated', 'records_failed', 'started_at',
            'completed_at', 'duration_seconds', 'error_message'
        ]
        read_only_fields = fields


class WebhookEndpointSerializer(serializers.ModelSerializer):
    """Serializer for webhook endpoints"""
    
    class Meta:
        model = WebhookEndpoint
        fields = [
            'id', 'connection', 'event_type', 'is_active',
            'last_received_at', 'total_events_received', 'created_at'
        ]
        read_only_fields = [
            'id', 'webhook_secret', 'last_received_at',
            'total_events_received', 'created_at'
        ]


class IntegrationDataMappingSerializer(serializers.ModelSerializer):
    """Serializer for data mappings"""
    provider_name = serializers.CharField(source='provider.display_name', read_only=True)
    
    class Meta:
        model = IntegrationDataMapping
        fields = [
            'id', 'provider', 'provider_name', 'data_type',
            'external_endpoint', 'external_object_type',
            'field_mappings', 'is_default', 'is_active'
        ]


class OAuthAuthorizeSerializer(serializers.Serializer):
    """Serializer for OAuth authorization request"""
    provider_id = serializers.UUIDField()
    redirect_uri = serializers.URLField()


class OAuthCallbackSerializer(serializers.Serializer):
    """Serializer for OAuth callback"""
    code = serializers.CharField()
    state = serializers.CharField()


class SyncTriggerSerializer(serializers.Serializer):
    """Serializer for triggering manual sync"""
    sync_type = serializers.ChoiceField(
        choices=['full', 'incremental', 'test'],
        default='incremental'
    )
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)
