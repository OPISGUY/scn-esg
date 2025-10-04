/**
 * Smart Data Entry - Conversational AI Service
 * API client for context-aware conversational data extraction
 */

import { buildApiUrl } from '../utils/api';

// ============================================================================
// TypeScript Types
// ============================================================================

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ExtractedData {
  activity_type: string;
  scope: 1 | 2 | 3;
  quantity: number;
  unit: string;
  period?: string;
  emission_factor: number;
  emission_factor_source: string;
  calculated_emissions: number;
  confidence: number;
  location?: string;
}

export interface ValidationResult {
  status: 'ok' | 'warning' | 'needs_clarification';
  anomalies: string[];
  warnings: string[];
  comparison_to_current?: string;
}

export interface SuggestedAction {
  type: 'update_footprint';
  field: 'scope1_emissions' | 'scope2_emissions' | 'scope3_emissions';
  operation: 'add' | 'set' | 'subtract';
  value: number;
  requires_confirmation: boolean;
}

export interface ConversationalExtractionResponse {
  success: boolean;
  session_id: string;
  message_id: string;
  extracted_data: ExtractedData | null;
  validation: ValidationResult;
  ai_response: string;
  clarifying_questions: string[];
  suggested_actions: SuggestedAction[];
  processing_time_ms: number;
  session_summary: SessionSummary;
}

export interface SessionSummary {
  total_messages: number;
  data_entries: number;
  emissions_added: number;
  confidence_avg: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateWithContextRequest {
  footprint_id: string;
  update_data: {
    [key: string]: {
      operation: 'add' | 'set' | 'subtract';
      value: number;
      source: string;
      confidence: number;
      metadata?: Record<string, any>;
    };
  };
  conversation_message_id?: string;
  user_confirmed: boolean;
}

export interface UpdateWithContextResponse {
  success: boolean;
  updated_footprint: {
    id: string;
    scope1_emissions: number;
    scope2_emissions: number;
    scope3_emissions: number;
    total_emissions: number;
    last_updated: string;
  };
  changes: {
    [key: string]: {
      previous: number;
      new: number;
      change: number;
      operation: string;
      metadata?: Record<string, any>;
    };
  };
  audit_trail: {
    changed_by: string;
    changed_at: string;
    source: string;
    message_id?: string;
    user_confirmed: boolean;
  };
}

export interface ConversationSessionDetails {
  session_id: string;
  company_id: string;
  footprint_id: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  participants: Array<{
    user_id: string;
    username: string;
    email: string;
  }>;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    author: string;
    timestamp: string;
    extracted_data: ExtractedData | null;
    confidence_score: number | null;
    footprint_updated: boolean;
  }>;
  summary: SessionSummary;
}

// ============================================================================
// API Service Class
// ============================================================================

class ConversationalAIService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = buildApiUrl('/carbon/ai');
    console.log('🔧 ConversationalAIService baseUrl:', this.baseUrl);
  }

  /**
   * Set authentication token for API requests
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  /**
   * Extract emissions data from conversational input
   * Core method for Phase 1 MVP
   */
  async extractFromConversation(
    message: string,
    conversationHistory: Message[],
    currentFootprintId?: string,
    sessionId?: string,
    companyId?: string
  ): Promise<ConversationalExtractionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/extract-from-conversation/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message,
          conversation_history: conversationHistory,
          current_footprint_id: currentFootprintId,
          session_id: sessionId,
          company_id: companyId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error extracting from conversation:', error);
      throw error;
    }
  }

  /**
   * Update carbon footprint with context-aware data
   */
  async updateWithContext(
    request: UpdateWithContextRequest
  ): Promise<UpdateWithContextResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/update-with-context/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating with context:', error);
      throw error;
    }
  }

  /**
   * Get conversation session details
   */
  async getSession(sessionId: string): Promise<ConversationSessionDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${sessionId}/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation session
   */
  async createSession(
    footprintId?: string,
    title?: string
  ): Promise<{ session_id: string; created_at: string; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          footprint_id: footprintId,
          title: title || `Conversation ${new Date().toLocaleString()}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Build update data object from extracted data
   * Helper method to construct UpdateWithContextRequest
   */
  buildUpdateData(
    extractedData: ExtractedData,
    operation: 'add' | 'set' | 'subtract' = 'add'
  ): UpdateWithContextRequest['update_data'] {
    const scopeField = `scope${extractedData.scope}_emissions` as 
      'scope1_emissions' | 'scope2_emissions' | 'scope3_emissions';

    return {
      [scopeField]: {
        operation,
        value: extractedData.calculated_emissions,
        source: 'conversational_extraction',
        confidence: extractedData.confidence,
        metadata: {
          activity_type: extractedData.activity_type,
          quantity: extractedData.quantity,
          unit: extractedData.unit,
          period: extractedData.period,
          emission_factor: extractedData.emission_factor,
          emission_factor_source: extractedData.emission_factor_source,
          location: extractedData.location,
        },
      },
    };
  }
}

// Export singleton instance
export const conversationalAIService = new ConversationalAIService();

// Export class for testing
export { ConversationalAIService };
