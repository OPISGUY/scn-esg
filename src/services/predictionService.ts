/**
 * Prediction Service - Phase 3 Week 1
 * Client for AI-powered predictive analytics and forecasting
 */

import { buildApiUrl } from '../utils/api';

// ==================== TYPE DEFINITIONS ====================

export interface PredictionRequest {
  company_id: number;
  activity_type: string;
  target_period: string; // YYYY-MM-DD format
  footprint_id?: number;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
}

export interface PredictionResponse {
  success: boolean;
  predicted_value: number | null;
  confidence_score: number | null;
  confidence_interval: ConfidenceInterval | null;
  reasoning: string | null;
  historical_average: number | null;
  seasonal_factor: number | null;
  growth_factor: number | null;
  data_points_used: number | null;
  message: string | null;
}

export interface MonthlyFactor {
  month: number;
  month_name: string;
  factor: number;
  average_value: number | null;
}

export interface SeasonalPatternRequest {
  company_id: number;
  activity_type: string;
  footprint_id?: number;
}

export interface SeasonalPatternResponse {
  success: boolean;
  pattern_detected: boolean;
  pattern_description: string | null;
  monthly_factors: MonthlyFactor[] | null;
  peak_month: string | null;
  low_month: string | null;
  pattern_strength: number | null;
  data_points_analyzed: number | null;
  message: string | null;
}

export interface MonthlyGrowth {
  month: string;
  growth_rate: number;
}

export interface GrowthTrendRequest {
  company_id: number;
  activity_type: string;
  footprint_id?: number;
}

export interface GrowthTrendResponse {
  success: boolean;
  annual_growth_rate: number | null;
  trend_direction: 'increasing' | 'decreasing' | 'stable' | null;
  trend_significance: number | null;
  trend_confidence: number | null;
  monthly_growth_rates: MonthlyGrowth[] | null;
  reasoning: string | null;
  data_points_analyzed: number | null;
  message: string | null;
}

// ==================== SERVICE CLASS ====================

class PredictionService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Predict next emissions value for a specific activity type
   * 
   * @param request - Prediction request parameters
   * @returns Predicted value with confidence score and reasoning
   * 
   * @example
   * const prediction = await predictionService.predictNextValue({
   *   company_id: 1,
   *   activity_type: 'electricity',
   *   target_period: '2025-11-01'
   * });
   * 
   * if (prediction.success) {
   *   console.log(`Predicted: ${prediction.predicted_value} tCO2e`);
   *   console.log(`Confidence: ${(prediction.confidence_score * 100).toFixed(0)}%`);
   *   console.log(`Range: ${prediction.confidence_interval.lower} - ${prediction.confidence_interval.upper}`);
   * }
   */
  async predictNextValue(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      const response = await fetch(buildApiUrl('/api/v1/carbon/ai/predict/'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.detail || 
          `Prediction failed: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  /**
   * Analyze seasonal patterns in emissions data
   * 
   * @param request - Seasonal pattern request parameters
   * @returns Monthly factors, peak/low months, and pattern strength
   * 
   * @example
   * const patterns = await predictionService.getSeasonalPatterns({
   *   company_id: 1,
   *   activity_type: 'electricity'
   * });
   * 
   * if (patterns.pattern_detected) {
   *   console.log(`Peak month: ${patterns.peak_month}`);
   *   console.log(`Low month: ${patterns.low_month}`);
   *   console.log(`Pattern strength: ${(patterns.pattern_strength * 100).toFixed(0)}%`);
   *   patterns.monthly_factors?.forEach(factor => {
   *     console.log(`${factor.month_name}: ${(factor.factor * 100).toFixed(0)}% of average`);
   *   });
   * }
   */
  async getSeasonalPatterns(request: SeasonalPatternRequest): Promise<SeasonalPatternResponse> {
    try {
      const response = await fetch(buildApiUrl('/api/v1/carbon/ai/predict/seasonal/'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.detail || 
          `Seasonal pattern analysis failed: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Seasonal pattern error:', error);
      throw error;
    }
  }

  /**
   * Calculate growth trend for emissions activity
   * 
   * @param request - Growth trend request parameters
   * @returns Annual growth rate, trend direction, and monthly growth rates
   * 
   * @example
   * const trend = await predictionService.getGrowthTrend({
   *   company_id: 1,
   *   activity_type: 'electricity'
   * });
   * 
   * if (trend.success) {
   *   console.log(`Annual growth: ${trend.annual_growth_rate?.toFixed(1)}%`);
   *   console.log(`Trend direction: ${trend.trend_direction}`);
   *   console.log(`Confidence: ${(trend.trend_confidence * 100).toFixed(0)}%`);
   * }
   */
  async getGrowthTrend(request: GrowthTrendRequest): Promise<GrowthTrendResponse> {
    try {
      const response = await fetch(buildApiUrl('/api/v1/carbon/ai/predict/trend/'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.detail || 
          `Growth trend analysis failed: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Growth trend error:', error);
      throw error;
    }
  }

  /**
   * Get all predictions for a company and activity type
   * Combines next value prediction, seasonal patterns, and growth trends
   * 
   * @param companyId - Company ID
   * @param activityType - Activity type to analyze
   * @param targetPeriod - Target period for prediction (YYYY-MM-DD)
   * @param footprintId - Optional footprint ID
   * @returns Combined analysis results
   */
  async getCompletePredictionAnalysis(
    companyId: number,
    activityType: string,
    targetPeriod: string,
    footprintId?: number
  ): Promise<{
    prediction: PredictionResponse;
    seasonal: SeasonalPatternResponse;
    trend: GrowthTrendResponse;
  }> {
    try {
      const [prediction, seasonal, trend] = await Promise.all([
        this.predictNextValue({ company_id: companyId, activity_type: activityType, target_period: targetPeriod, footprint_id: footprintId }),
        this.getSeasonalPatterns({ company_id: companyId, activity_type: activityType, footprint_id: footprintId }),
        this.getGrowthTrend({ company_id: companyId, activity_type: activityType, footprint_id: footprintId }),
      ]);

      return { prediction, seasonal, trend };
    } catch (error) {
      console.error('Complete prediction analysis error:', error);
      throw error;
    }
  }

  /**
   * Format confidence score for display
   */
  formatConfidence(score: number | null): string {
    if (score === null) return 'N/A';
    const percentage = (score * 100).toFixed(0);
    if (score >= 0.8) return `${percentage}% (High)`;
    if (score >= 0.6) return `${percentage}% (Medium)`;
    return `${percentage}% (Low)`;
  }

  /**
   * Get confidence color for UI display
   */
  getConfidenceColor(score: number | null): string {
    if (score === null) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Format trend direction for display
   */
  formatTrendDirection(direction: string | null): string {
    if (!direction) return 'Unknown';
    return direction.charAt(0).toUpperCase() + direction.slice(1);
  }

  /**
   * Get trend direction icon
   */
  getTrendIcon(direction: string | null): string {
    if (!direction) return '➡️';
    if (direction === 'increasing') return '📈';
    if (direction === 'decreasing') return '📉';
    return '➡️';
  }
}

// Export singleton instance
export const predictionService = new PredictionService();
