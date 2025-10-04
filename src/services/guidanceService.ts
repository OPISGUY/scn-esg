// src/services/guidanceService.ts
/**
 * Guidance Service
 * 
 * TypeScript client for proactive guidance, onboarding, and completeness tracking
 */

import { buildApiUrl } from '../utils/api';

// ========== TYPE DEFINITIONS ==========

export interface CompletenessScore {
  overall_score: number;
  scope1_score: number;
  scope2_score: number;
  scope3_score: number;
  missing_activities: string[];
  missing_by_scope: {
    scope1: string[];
    scope2: string[];
    scope3: string[];
  };
  completion_percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  meets_minimum: boolean;
}

export interface MissingDataAlert {
  priority: 'high' | 'medium' | 'low';
  scope: string;
  activity: string;
  message: string;
  suggestion: string;
  action: string;
}

export interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  questions: Array<{
    id: string;
    type: 'select' | 'multi_select' | 'number' | 'boolean' | 'text';
    label: string;
    options?: string[];
    required: boolean;
    help_text?: string;
    show_if?: string;
  }>;
  activity?: string;
  scope?: string;
  estimated_time: string;
  optional?: boolean;
  final?: boolean;
}

export interface SeasonalReminder {
  type: 'monthly' | 'quarterly' | 'annual' | 'utility_cycle';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action: string;
}

export interface NextAction {
  priority: 'high' | 'medium' | 'low';
  title: string;
  reason: string;
  action: string;
  estimated_impact: string;
  icon: string;
}

// ========== SERVICE CLASS ==========

class GuidanceService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Get completeness score for a footprint
   */
  async getCompletenessScore(footprintId: string): Promise<CompletenessScore> {
    const url = buildApiUrl(`/carbon/guidance/completeness/${footprintId}/`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get completeness score');
    }

    return response.json();
  }

  /**
   * Get missing data alerts
   */
  async getMissingDataAlerts(footprintId: string): Promise<{
    alerts: MissingDataAlert[];
    count: number;
  }> {
    const url = buildApiUrl(`/carbon/guidance/missing-data/${footprintId}/`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get missing data alerts');
    }

    return response.json();
  }

  /**
   * Get onboarding wizard flow
   */
  async getOnboardingFlow(): Promise<{
    steps: OnboardingStep[];
    total_steps: number;
    estimated_total_time: string;
  }> {
    const url = buildApiUrl('/carbon/guidance/onboarding/');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get onboarding flow');
    }

    return response.json();
  }

  /**
   * Get seasonal reminders
   */
  async getSeasonalReminders(): Promise<{
    reminders: SeasonalReminder[];
    count: number;
  }> {
    const url = buildApiUrl('/carbon/guidance/reminders/');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get seasonal reminders');
    }

    return response.json();
  }

  /**
   * Get smart next actions
   */
  async getNextActions(footprintId: string): Promise<{
    actions: NextAction[];
    count: number;
  }> {
    const url = buildApiUrl(`/carbon/guidance/next-actions/${footprintId}/`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get next actions');
    }

    return response.json();
  }

  /**
   * Get grade color for UI
   */
  getGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'F': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Get priority color for UI
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Format activity name for display
   */
  formatActivityName(activity: string): string {
    return activity
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Get scope display name
   */
  getScopeDisplayName(scope: string): string {
    const names: Record<string, string> = {
      'scope1': 'Scope 1 (Direct)',
      'scope2': 'Scope 2 (Energy)',
      'scope3': 'Scope 3 (Indirect)',
    };
    return names[scope] || scope;
  }
}

// Export singleton instance
export const guidanceService = new GuidanceService();
