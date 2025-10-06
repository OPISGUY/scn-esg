# External Platform Integrations - Implementation Guide

## 🚧 Status: Infrastructure Ready, Coming Soon in Production

## Overview

The SCN ESG platform has a complete integration infrastructure ready for external platforms including:
- **Accounting**: Xero, QuickBooks
- **Cloud**: AWS, Azure, Google Cloud
- **CRM**: Salesforce
- **Communication**: Slack, Microsoft Teams

**Current Status:** All backend infrastructure, API endpoints, and frontend UI are implemented and ready. The features are marked as **"Coming Soon"** in production until OAuth credentials are configured with each external platform.

This implementation provides OAuth 2.0 authentication, automatic data synchronization, webhooks, and secure credential storage.

---

## Architecture

### Backend Components

1. **Models** (`integrations/models.py`):
   - `IntegrationProvider`: Available platforms (Xero, QuickBooks, etc.)
   - `IntegrationConnection`: User connections to platforms
   - `IntegrationSyncLog`: Sync history and results
   - `WebhookEndpoint`: Webhook configurations
   - `IntegrationDataMapping`: Field mapping configurations

2. **OAuth Handler** (`integrations/oauth_utils.py`):
   - OAuth 2.0 authorization flow
   - Token exchange and refresh
   - Encrypted credential storage

3. **Platform Services** (`integrations/services.py`):
   - Platform-specific API clients
   - Data fetching and transformation
   - Emission calculation from financial/cloud data

4. **API Endpoints** (`integrations/views.py`):
   - `/api/v1/integrations/providers/` - List available platforms
   - `/api/v1/integrations/connections/` - Manage connections
   - `/api/v1/integrations/oauth/authorize/` - Start OAuth flow
   - `/api/v1/integrations/oauth/callback/` - Complete OAuth
   - `/api/v1/integrations/webhooks/<provider>/<id>/` - Receive webhooks

5. **Background Tasks** (`integrations/tasks.py`):
   - `sync_integration_data` - Sync data from external platforms
   - `schedule_auto_syncs` - Schedule automatic syncs
   - `refresh_expiring_tokens` - Refresh OAuth tokens

### Frontend Components

1. **Integration Service** (`src/services/integrationService.ts`):
   - TypeScript service for API calls
   - Type-safe interfaces
   - OAuth flow helpers

2. **Integrations Page** (`src/pages/IntegrationsPage.tsx`):
   - Browse available integrations
   - Connect/disconnect platforms
   - View connection status
   - Trigger manual syncs

---

## Setup Instructions

### 1. Install Dependencies

```bash
# Backend - add to requirements.txt
cryptography>=41.0.0
requests>=2.31.0

# Install
pip install cryptography requests
```

### 2. Generate Encryption Key

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Save this key - you'll need it for encryption!

### 3. Environment Variables

Add these to your `.env` file:

```bash
# Integration encryption key
INTEGRATION_ENCRYPTION_KEY=<key from step 2>

# Xero OAuth credentials (get from https://developer.xero.com)
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret

# QuickBooks OAuth credentials (get from https://developer.intuit.com)
QUICKBOOKS_CLIENT_ID=your_quickbooks_client_id
QUICKBOOKS_CLIENT_SECRET=your_quickbooks_client_secret

# Salesforce OAuth credentials (get from https://developer.salesforce.com)
SALESFORCE_CLIENT_ID=your_salesforce_client_id
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret

# Slack OAuth credentials (get from https://api.slack.com/apps)
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret

# AWS credentials
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# Azure credentials
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant

# GCP credentials
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project
GOOGLE_CLOUD_API_KEY=your_gcp_key
```

### 4. Run Migrations

```bash
cd backend
python manage.py makemigrations integrations
python manage.py migrate
```

### 5. Seed Integration Providers

```bash
python manage.py seed_integration_providers
```

### 6. Configure Celery (for auto-sync)

In `settings_render.py`, add:

```python
# Celery Beat Schedule
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'auto-sync-integrations': {
        'task': 'integrations.tasks.schedule_auto_syncs',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
    'refresh-tokens': {
        'task': 'integrations.tasks.refresh_expiring_tokens',
        'schedule': crontab(minute=0, hour='*/1'),  # Every hour
    },
}
```

---

## OAuth Setup Guides

### Xero

1. Go to https://developer.xero.com/myapps
2. Create new app
3. Set redirect URI: `https://yourdomain.com/integrations/callback`
4. Copy Client ID and Secret to `.env`
5. Add scopes: `accounting.transactions.read`, `accounting.contacts.read`

### QuickBooks

1. Go to https://developer.intuit.com
2. Create new app
3. Set redirect URI: `https://yourdomain.com/integrations/callback`
4. Copy Client ID and Secret to `.env`
5. Enable scope: `com.intuit.quickbooks.accounting`

### Salesforce

1. Go to Salesforce Setup → App Manager
2. Create new Connected App
3. Enable OAuth Settings
4. Set callback URL: `https://yourdomain.com/integrations/callback`
5. Select scopes: `api`, `refresh_token`
6. Copy Consumer Key and Secret

### Slack

1. Go to https://api.slack.com/apps
2. Create new app
3. OAuth & Permissions → Add redirect URL
4. Bot Token Scopes: `chat:write`, `chat:write.public`
5. Install to workspace
6. Copy Client ID and Secret

---

## Usage Examples

### Frontend - Connecting an Integration

```typescript
import { integrationService } from '../services/integrationService';

// List available providers
const providers = await integrationService.getProviders();

// Connect via OAuth
const { authorization_url } = await integrationService.initiateOAuth(
  providerId,
  window.location.origin + '/integrations/callback'
);
window.location.href = authorization_url;

// After OAuth callback
const connection = await integrationService.completeOAuth(code, state);

// Connect via API key
const connection = await integrationService.connectWithApiKey(
  providerId,
  apiKey,
  'My Connection'
);

// Trigger sync
await integrationService.triggerSync(connectionId);

// Disconnect
await integrationService.disconnect(connectionId);
```

### Backend - Custom Integration Service

```python
from integrations.services import IntegrationClient

class MyCustomIntegration(IntegrationClient):
    """Custom platform integration"""
    
    def fetch_data(self):
        """Fetch data from custom platform"""
        return self.make_request('GET', '/api/data')
    
    def map_to_carbon_data(self, data):
        """Transform to carbon emissions"""
        return [
            {
                'category': 'energy',
                'emissions': item['kwh'] * 0.5,  # kg CO2
                'date': item['date'],
            }
            for item in data
        ]

# Register in INTEGRATION_CLASSES
from integrations.services import INTEGRATION_CLASSES
INTEGRATION_CLASSES['my_platform'] = MyCustomIntegration
```

---

## Security Considerations

1. **Credential Encryption**: All OAuth tokens and API keys are encrypted using Fernet symmetric encryption
2. **HTTPS Only**: OAuth callbacks require HTTPS in production
3. **State Parameter**: CSRF protection via state parameter
4. **Token Refresh**: Automatic refresh before expiration
5. **Webhook Verification**: Implement signature verification for webhooks

---

## Data Mapping

### Xero → Carbon Emissions

```python
# Financial transactions → Travel emissions
if 'travel' in transaction.category:
    emissions = transaction.amount * TRAVEL_EMISSION_FACTOR
```

### AWS → Cloud Emissions

```python
# EC2 instance hours → Emissions
emissions = vcpu_hours * 0.000379  # kg CO2 per vCPU hour
```

### QuickBooks → Energy Emissions

```python
# Utility expenses → Energy usage
if 'electric' in expense.description:
    emissions = expense.amount / electricity_rate * GRID_FACTOR
```

---

## Webhooks

### Registering a Webhook

```python
webhook = WebhookEndpoint.objects.create(
    connection=connection,
    event_type='transaction.created',
    webhook_secret=generate_secret(),
)

# Register with external platform
client = get_integration_client(connection)
client.register_webhook(
    url=f"https://yourdomain.com/api/v1/integrations/webhooks/{provider}/{connection.id}/",
    secret=webhook.webhook_secret
)
```

### Handling Webhooks

The system automatically receives webhooks at:
`/api/v1/integrations/webhooks/<provider_name>/<connection_id>/`

---

## Troubleshooting

### Token Expired Error

```bash
# Manual token refresh
python manage.py shell
>>> from integrations.tasks import refresh_expiring_tokens
>>> refresh_expiring_tokens()
```

### Sync Failures

Check sync logs:
```python
from integrations.models import IntegrationSyncLog

# View recent failures
logs = IntegrationSyncLog.objects.filter(status='failed').order_by('-started_at')[:10]
for log in logs:
    print(f"{log.connection.provider.display_name}: {log.error_message}")
```

### Connection Status Issues

```python
from integrations.models import IntegrationConnection

# Find problematic connections
connections = IntegrationConnection.objects.filter(status__in=['error', 'expired'])
for conn in connections:
    print(f"{conn.provider.display_name}: {conn.error_message}")
```

---

## API Reference

### GET /api/v1/integrations/providers/
List available integration providers

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "xero",
    "display_name": "Xero",
    "category": "accounting",
    "description": "Sync financial data...",
    "auth_method": "oauth2",
    "is_active": true,
    "supports_webhooks": true
  }
]
```

### POST /api/v1/integrations/oauth/authorize/
Initiate OAuth flow

**Request:**
```json
{
  "provider_id": "uuid",
  "redirect_uri": "https://yourdomain.com/callback"
}
```

**Response:**
```json
{
  "authorization_url": "https://provider.com/oauth/authorize?...",
  "state": "random-state-token"
}
```

### POST /api/v1/integrations/oauth/callback/
Complete OAuth authorization

**Request:**
```json
{
  "code": "oauth-code",
  "state": "random-state-token"
}
```

**Response:** Returns `IntegrationConnection` object

### POST /api/v1/integrations/connections/{id}/trigger_sync/
Manually trigger data sync

**Request:**
```json
{
  "sync_type": "incremental",
  "start_date": "2025-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "message": "Sync started",
  "sync_log_id": "uuid"
}
```

---

## Next Steps

1. **Test OAuth flows** with sandbox accounts
2. **Configure webhooks** for real-time updates
3. **Customize data mappings** for your needs
4. **Monitor sync logs** in production
5. **Add more platforms** using the extensible architecture

---

## Support

For issues or questions:
- Check sync logs in Django admin
- Review Celery task logs
- Verify OAuth credentials
- Test API endpoints with Postman

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
