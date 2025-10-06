"""
Models for external platform integrations
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import URLValidator
import uuid
import json
from cryptography.fernet import Fernet


class IntegrationProvider(models.Model):
    """
    Supported external platform providers (Xero, QuickBooks, Salesforce, etc.)
    """
    CATEGORY_CHOICES = [
        ('accounting', 'Accounting'),
        ('cloud', 'Cloud Provider'),
        ('crm', 'CRM'),
        ('erp', 'ERP'),
        ('communication', 'Communication'),
        ('data', 'Data Platform'),
        ('iot', 'IoT/Energy'),
    ]
    
    AUTH_METHODS = [
        ('oauth2', 'OAuth 2.0'),
        ('api_key', 'API Key'),
        ('basic', 'Basic Auth'),
        ('custom', 'Custom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()
    logo_url = models.URLField(blank=True)
    website_url = models.URLField(validators=[URLValidator()])
    
    # Authentication configuration
    auth_method = models.CharField(max_length=20, choices=AUTH_METHODS, default='oauth2')
    oauth_authorize_url = models.URLField(blank=True)
    oauth_token_url = models.URLField(blank=True)
    oauth_scopes = models.JSONField(default=list, blank=True)
    api_base_url = models.URLField(blank=True)
    
    # Feature flags
    is_active = models.BooleanField(default=True)
    is_beta = models.BooleanField(default=False)
    supports_webhooks = models.BooleanField(default=False)
    supports_real_time_sync = models.BooleanField(default=False)
    
    # Metadata
    documentation_url = models.URLField(blank=True)
    setup_instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_name']
        verbose_name = 'Integration Provider'
        verbose_name_plural = 'Integration Providers'
    
    def __str__(self):
        return self.display_name


class IntegrationConnection(models.Model):
    """
    User's connection to an external platform
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Setup'),
        ('active', 'Active'),
        ('expired', 'Token Expired'),
        ('error', 'Error'),
        ('disconnected', 'Disconnected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='integrations')
    provider = models.ForeignKey(IntegrationProvider, on_delete=models.CASCADE, related_name='connections')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='integrations', null=True, blank=True)
    
    # Connection details
    connection_name = models.CharField(max_length=200, help_text="User-defined name for this connection")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Encrypted credentials (DO NOT store in plain text)
    encrypted_credentials = models.TextField(help_text="Encrypted OAuth tokens or API keys")
    
    # OAuth specific fields
    access_token_expires_at = models.DateTimeField(null=True, blank=True)
    refresh_token_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Sync configuration
    auto_sync_enabled = models.BooleanField(default=True)
    sync_frequency_minutes = models.IntegerField(default=60, help_text="How often to sync data (in minutes)")
    last_sync_at = models.DateTimeField(null=True, blank=True)
    next_sync_at = models.DateTimeField(null=True, blank=True)
    
    # Data mapping configuration
    data_mappings = models.JSONField(default=dict, blank=True, help_text="Map external fields to our schema")
    sync_filters = models.JSONField(default=dict, blank=True, help_text="Filters for what data to sync")
    
    # Metadata
    external_account_id = models.CharField(max_length=200, blank=True)
    external_account_name = models.CharField(max_length=200, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Integration Connection'
        verbose_name_plural = 'Integration Connections'
        unique_together = [['user', 'provider', 'external_account_id']]
    
    def __str__(self):
        return f"{self.user.email} - {self.provider.display_name}"
    
    def is_token_expired(self):
        """Check if the access token is expired"""
        if self.access_token_expires_at:
            return timezone.now() >= self.access_token_expires_at
        return False
    
    def needs_refresh(self):
        """Check if token needs to be refreshed soon (within 5 minutes)"""
        if self.access_token_expires_at:
            return timezone.now() >= (self.access_token_expires_at - timezone.timedelta(minutes=5))
        return False


class IntegrationSyncLog(models.Model):
    """
    Log of data synchronization activities
    """
    STATUS_CHOICES = [
        ('started', 'Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('partial', 'Partially Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    connection = models.ForeignKey(IntegrationConnection, on_delete=models.CASCADE, related_name='sync_logs')
    
    # Sync details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='started')
    sync_type = models.CharField(max_length=50, default='scheduled', help_text="manual, scheduled, webhook")
    
    # Results
    records_fetched = models.IntegerField(default=0)
    records_processed = models.IntegerField(default=0)
    records_created = models.IntegerField(default=0)
    records_updated = models.IntegerField(default=0)
    records_failed = models.IntegerField(default=0)
    
    # Timing
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.FloatField(null=True, blank=True)
    
    # Error tracking
    error_message = models.TextField(blank=True)
    error_details = models.JSONField(default=dict, blank=True)
    
    # Metadata
    sync_metadata = models.JSONField(default=dict, blank=True, help_text="Additional sync information")
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Integration Sync Log'
        verbose_name_plural = 'Integration Sync Logs'
    
    def __str__(self):
        return f"{self.connection.provider.display_name} sync at {self.started_at}"


class WebhookEndpoint(models.Model):
    """
    Webhook endpoints for receiving real-time updates from external platforms
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    connection = models.ForeignKey(IntegrationConnection, on_delete=models.CASCADE, related_name='webhooks')
    
    # Webhook configuration
    event_type = models.CharField(max_length=100, help_text="Type of events this webhook handles")
    external_webhook_id = models.CharField(max_length=200, blank=True)
    webhook_secret = models.CharField(max_length=200, help_text="Secret for verifying webhook signatures")
    
    # Status
    is_active = models.BooleanField(default=True)
    last_received_at = models.DateTimeField(null=True, blank=True)
    total_events_received = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Webhook Endpoint'
        verbose_name_plural = 'Webhook Endpoints'
    
    def __str__(self):
        return f"{self.connection.provider.display_name} webhook - {self.event_type}"


class IntegrationDataMapping(models.Model):
    """
    Configurable mappings between external platform data and our data models
    """
    DATA_TYPES = [
        ('carbon_emission', 'Carbon Emission'),
        ('financial_transaction', 'Financial Transaction'),
        ('energy_usage', 'Energy Usage'),
        ('waste_data', 'Waste Data'),
        ('employee_data', 'Employee Data'),
        ('supplier_data', 'Supplier Data'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(IntegrationProvider, on_delete=models.CASCADE, related_name='data_mappings')
    
    # Mapping details
    data_type = models.CharField(max_length=50, choices=DATA_TYPES)
    external_endpoint = models.CharField(max_length=200, help_text="API endpoint to fetch this data")
    external_object_type = models.CharField(max_length=100, help_text="External object/resource type")
    
    # Field mappings (JSON structure defining how to map fields)
    field_mappings = models.JSONField(default=dict, help_text="Map external fields to our schema")
    transformation_rules = models.JSONField(default=dict, blank=True, help_text="Data transformation logic")
    
    # Configuration
    is_default = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['provider', 'data_type']
        verbose_name = 'Integration Data Mapping'
        verbose_name_plural = 'Integration Data Mappings'
        unique_together = [['provider', 'data_type', 'external_object_type']]
    
    def __str__(self):
        return f"{self.provider.display_name} - {self.get_data_type_display()}"
