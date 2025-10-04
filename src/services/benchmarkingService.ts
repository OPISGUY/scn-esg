// src/services/benchmarkingService.ts
/**
 * Benchmarking Service
 * 
 * TypeScript client for industry peer comparison and benchmarking
 */

import { buildApiUrl } from '../utils/api';

// ========== TYPE DEFINITIONS ==========

export interface CompanyEmissions {
  total: number;
  per_employee: number;
  scope1: number;
  scope2: number;
  scope3: number;
  scope1_per_employee: number;
  scope2_per_employee: number;
  scope3_per_employee: number | null;
}

export interface IndustryAverage {
  total_per_employee: number;
  scope1_per_employee: number;
  scope2_per_employee: number;
  scope3_per_employee: number | null;
}

export interface BenchmarkInfo {
  industry: string;
  employee_range: string;
  region: string;
  year: number;
  sample_size: number;
}

export interface Comparison {
  total_vs_average: number;
  ranking_percentile: number;
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

export interface PeerComparison {
  company_emissions: CompanyEmissions;
  industry_average: IndustryAverage;
  benchmark_info: BenchmarkInfo;
  comparison: Comparison;
  insights: string[];
}

export interface ImprovementOpportunity {
  scope: string;
  title: string;
  description: string;
  potential_reduction: number;
  actions: string[];
  estimated_cost: string;
  payback_period: string;
  priority: 'high' | 'medium' | 'low';
}

export interface IndustryLeader {
  rank: number;
  emissions_per_employee: number;
  vs_average: number;
  key_initiatives: string[];
}

// ========== SERVICE CLASS ==========

class BenchmarkingService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Get peer comparison for a footprint
   */
  async getPeerComparison(footprintId: string): Promise<PeerComparison> {
    const url = buildApiUrl(`/carbon/benchmarking/compare/${footprintId}/`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get peer comparison');
    }

    return response.json();
  }

  /**
   * Get improvement opportunities
   */
  async getImprovementOpportunities(footprintId: string): Promise<{
    opportunities: ImprovementOpportunity[];
    count: number;
  }> {
    const url = buildApiUrl(`/carbon/benchmarking/opportunities/${footprintId}/`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get improvement opportunities');
    }

    return response.json();
  }

  /**
   * Get industry leaders
   */
  async getIndustryLeaders(): Promise<{
    leaders: IndustryLeader[];
    count: number;
  }> {
    const url = buildApiUrl('/carbon/benchmarking/leaders/');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get industry leaders');
    }

    return response.json();
  }

  /**
   * Get performance badge based on performance level
   */
  getPerformanceBadge(performance: string): {
    label: string;
    icon: string;
    color: string;
  } {
    switch (performance) {
      case 'excellent':
        return {
          label: 'Excellent',
          icon: '🏆',
          color: 'text-green-600 bg-green-50 border-green-200',
        };
      case 'good':
        return {
          label: 'Good',
          icon: '✅',
          color: 'text-blue-600 bg-blue-50 border-blue-200',
        };
      case 'average':
        return {
          label: 'Average',
          icon: '📊',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        };
      case 'needs_improvement':
        return {
          label: 'Needs Improvement',
          icon: '📈',
          color: 'text-orange-600 bg-orange-50 border-orange-200',
        };
      default:
        return {
          label: 'Unknown',
          icon: '❓',
          color: 'text-gray-600 bg-gray-50 border-gray-200',
        };
    }
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  /**
   * Get percentile display text
   */
  getPercentileText(percentile: number): string {
    if (percentile <= 25) {
      return `Top ${percentile}% (Better than ${100 - percentile}% of peers)`;
    } else if (percentile <= 50) {
      return `Above average (Better than ${100 - percentile}% of peers)`;
    } else if (percentile <= 75) {
      return `Below average (Better than ${100 - percentile}% of peers)`;
    } else {
      return `Bottom ${percentile}% (Improvement needed)`;
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
   * Format emissions value
   */
  formatEmissions(value: number): string {
    return value.toFixed(2);
  }

  /**
   * Calculate potential savings
   */
  calculatePotentialSavings(opportunities: ImprovementOpportunity[]): number {
    return opportunities.reduce((sum, opp) => sum + opp.potential_reduction, 0);
  }
}

// Export singleton instance
export const benchmarkingService = new BenchmarkingService();
