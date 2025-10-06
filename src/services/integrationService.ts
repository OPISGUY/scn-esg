/**
 * External Platform Integration Service
 * Handles connections to external platforms like Xero, QuickBooks, etc.
 */
import { buildApiUrl } from '../utils/api';

export interface IntegrationProvider {
  id: string;
  name: string;
  display_name: string;
  category: 'accounting' | 'cloud' | 'crm' | 'erp' | 'communication' | 'data' | 'iot';
  description: string;
  logo_url?: string;
  website_url: string;
  auth_method: 'oauth2' | 'api_key' | 'basic' | 'custom';
  is_active: boolean;
  is_beta: boolean;
  supports_webhooks: boolean;
  supports_real_time_sync: boolean;
  documentation_url?: string;
}

export interface IntegrationConnection {
  id: string;
  provider: string;
  provider_details: IntegrationProvider;
  connection_name: string;
  status: 'pending' | 'active' | 'expired' | 'error' | 'disconnected';
  auto_sync_enabled: boolean;
  sync_frequency_minutes: number;
  last_sync_at?: string;
  next_sync_at?: string;
  external_account_name?: string;
  created_at: string;
  updated_at: string;
  is_token_expired: boolean;
  error_message?: string;
}

export interface IntegrationSyncLog {
  id: string;
  connection: string;
  provider_name: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed' | 'partial';
  sync_type: string;
  records_fetched: number;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
}

class IntegrationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Get all available integration providers
   */
  async getProviders(): Promise<IntegrationProvider[]> {
    const url = buildApiUrl('/api/v1/integrations/providers/');
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch providers');
    }

    const data = await response.json();
    return data.results || data;
  }

  /**
   * Get provider categories
   */
  async getCategories(): Promise<string[]> {
    const url = buildApiUrl('/api/v1/integrations/providers/categories/');
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.categories;
  }

  /**
   * Get user's integration connections
   */
  async getConnections(): Promise<IntegrationConnection[]> {
    const url = buildApiUrl('/api/v1/integrations/connections/');
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch connections');
    }

    const data = await response.json();
    return data.results || data;
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(providerId: string, redirectUri: string): Promise<{ authorization_url: string; state: string }> {
    const url = buildApiUrl('/api/v1/integrations/oauth/authorize/');
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        provider_id: providerId,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initiate OAuth');
    }

    return response.json();
  }

  /**
   * Complete OAuth callback
   */
  async completeOAuth(code: string, state: string): Promise<IntegrationConnection> {
    const url = buildApiUrl('/api/v1/integrations/oauth/callback/');
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to complete OAuth');
    }

    return response.json();
  }

  /**
   * Connect using API key
   */
  async connectWithApiKey(
    providerId: string,
    apiKey: string,
    connectionName: string
  ): Promise<IntegrationConnection> {
    const url = buildApiUrl('/api/v1/integrations/connect/api-key/');
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        provider_id: providerId,
        api_key: apiKey,
        connection_name: connectionName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to connect');
    }

    return response.json();
  }

  /**
   * Trigger manual sync
   */
  async triggerSync(
    connectionId: string,
    syncType: 'full' | 'incremental' | 'test' = 'incremental'
  ): Promise<{ message: string; sync_log_id: string }> {
    const url = buildApiUrl(`/api/v1/integrations/connections/${connectionId}/trigger_sync/`);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ sync_type: syncType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to trigger sync');
    }

    return response.json();
  }

  /**
   * Disconnect integration
   */
  async disconnect(connectionId: string): Promise<void> {
    const url = buildApiUrl(`/api/v1/integrations/connections/${connectionId}/disconnect/`);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to disconnect');
    }
  }

  /**
   * Reconnect integration
   */
  async reconnect(connectionId: string): Promise<void> {
    const url = buildApiUrl(`/api/v1/integrations/connections/${connectionId}/reconnect/`);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reconnect');
    }
  }

  /**
   * Get sync history for a connection
   */
  async getSyncHistory(connectionId: string): Promise<IntegrationSyncLog[]> {
    const url = buildApiUrl(`/api/v1/integrations/connections/${connectionId}/sync_history/`);
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sync history');
    }

    return response.json();
  }

  /**
   * Get all sync logs
   */
  async getSyncLogs(): Promise<IntegrationSyncLog[]> {
    const url = buildApiUrl('/api/v1/integrations/sync-logs/');
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sync logs');
    }

    const data = await response.json();
    return data.results || data;
  }
}

export const integrationService = new IntegrationService();
