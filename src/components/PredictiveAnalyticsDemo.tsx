/**
 * PredictiveAnalyticsDemo - Phase 3 Week 1 Demo Component
 * Showcases predictive auto-fill, seasonal patterns, and growth trends
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle,
  Brain,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { carbonService } from '../services/carbonService';
import { predictionService } from '../services/predictionService';
import type {
  PredictionResponse,
  SeasonalPatternResponse,
  GrowthTrendResponse,
} from '../services/predictionService';

const PredictiveAnalyticsDemo: React.FC = () => {
  const { user } = useAuth();

  // State
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [activityType, setActivityType] = useState('electricity');
  const [targetDate, setTargetDate] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [seasonal, setSeasonal] = useState<SeasonalPatternResponse | null>(null);
  const [trend, setTrend] = useState<GrowthTrendResponse | null>(null);

  // Fetch company ID from user's footprints
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const footprints = await carbonService.getFootprints();
        if (footprints.length > 0 && footprints[0].company) {
          setCompanyId(footprints[0].company); // Company is now typed as number
        }
      } catch (err) {
        console.error('Failed to fetch company ID:', err);
      }
    };

    if (user) {
      fetchCompanyId();
    }
  }, [user]);

  // Handle prediction request
  const handlePredict = async () => {
    if (!companyId) {
      setError('No company found. Please create a footprint first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await predictionService.getCompletePredictionAnalysis(
        companyId,
        activityType,
        targetDate
      );

      setPrediction(result.prediction);
      setSeasonal(result.seasonal);
      setTrend(result.trend);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get predictions');
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Predictive Analytics Demo
              </h1>
              <p className="text-gray-600">
                Phase 3 Week 1: AI-powered forecasting, seasonal patterns, and growth trends
              </p>
            </div>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="electricity">Electricity</option>
                <option value="natural_gas">Natural Gas</option>
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="fuel_oil">Fuel Oil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Period
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handlePredict}
                disabled={isLoading}
                className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Get Predictions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Prediction Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {(prediction || seasonal || trend) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prediction Card */}
            {prediction && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Next Value Prediction
                    </h2>
                    <p className="text-sm text-gray-600">Forecasted emissions</p>
                  </div>
                </div>

                {prediction.success && prediction.predicted_value !== null ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Predicted Value</p>
                        <p className="text-4xl font-bold text-gray-900">
                          {prediction.predicted_value.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">tCO₂e</p>
                      </div>
                    </div>

                    {prediction.confidence_interval && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Confidence Range
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {prediction.confidence_interval.lower.toFixed(2)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {prediction.confidence_interval.upper.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Confidence Score</span>
                        <span
                          className={`font-semibold ${predictionService.getConfidenceColor(
                            prediction.confidence_score
                          )}`}
                        >
                          {predictionService.formatConfidence(prediction.confidence_score)}
                        </span>
                      </div>

                      {prediction.historical_average && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Historical Avg</span>
                          <span className="font-medium text-gray-900">
                            {prediction.historical_average.toFixed(2)} tCO₂e
                          </span>
                        </div>
                      )}

                      {prediction.seasonal_factor && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Seasonal Factor</span>
                          <span className="font-medium text-gray-900">
                            {(prediction.seasonal_factor * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}

                      {prediction.growth_factor && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Growth Factor</span>
                          <span className="font-medium text-gray-900">
                            {(prediction.growth_factor * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Data Points Used</span>
                        <span className="font-medium text-gray-900">
                          {prediction.data_points_used || 0}
                        </span>
                      </div>
                    </div>

                    {prediction.reasoning && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          💡 Analysis
                        </p>
                        <p className="text-xs text-blue-800">{prediction.reasoning}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Prediction successful</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      {prediction.message || 'No prediction available'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Seasonal Patterns Card */}
            {seasonal && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Seasonal Patterns
                    </h2>
                    <p className="text-sm text-gray-600">Monthly variations</p>
                  </div>
                </div>

                {seasonal.success && seasonal.pattern_detected ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-900">
                        {seasonal.pattern_description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Peak Month</p>
                        <p className="text-lg font-bold text-green-700">
                          {seasonal.peak_month}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Low Month</p>
                        <p className="text-lg font-bold text-blue-700">
                          {seasonal.low_month}
                        </p>
                      </div>
                    </div>

                    {seasonal.pattern_strength !== null && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Pattern Strength
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${seasonal.pattern_strength * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1 text-right">
                          {(seasonal.pattern_strength * 100).toFixed(0)}%
                        </p>
                      </div>
                    )}

                    {seasonal.monthly_factors && seasonal.monthly_factors.length > 0 && (
                      <div className="max-h-64 overflow-y-auto">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Monthly Factors
                        </p>
                        <div className="space-y-1">
                          {seasonal.monthly_factors.map((factor) => (
                            <div
                              key={factor.month}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                            >
                              <span className="text-xs font-medium text-gray-700">
                                {factor.month_name}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  factor.factor > 1.1
                                    ? 'text-red-600'
                                    : factor.factor < 0.9
                                    ? 'text-blue-600'
                                    : 'text-gray-600'
                                }`}
                              >
                                {(factor.factor * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        Pattern detected ({seasonal.data_points_analyzed} data points)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      {seasonal.message || 'No seasonal pattern detected'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Growth Trend Card */}
            {trend && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Growth Trend</h2>
                    <p className="text-sm text-gray-600">Long-term trajectory</p>
                  </div>
                </div>

                {trend.success && trend.annual_growth_rate !== null ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Annual Growth Rate</p>
                        <p className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
                          {trend.trend_direction === 'increasing' ? (
                            <TrendingUp className="w-8 h-8 text-red-500" />
                          ) : trend.trend_direction === 'decreasing' ? (
                            <TrendingDown className="w-8 h-8 text-green-500" />
                          ) : (
                            <ArrowRight className="w-8 h-8 text-gray-500" />
                          )}
                          {trend.annual_growth_rate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {predictionService.formatTrendDirection(trend.trend_direction)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {trend.trend_significance !== null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Significance</span>
                          <span className="font-medium text-gray-900">
                            {(trend.trend_significance * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}

                      {trend.trend_confidence !== null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Confidence</span>
                          <span
                            className={`font-semibold ${predictionService.getConfidenceColor(
                              trend.trend_confidence
                            )}`}
                          >
                            {predictionService.formatConfidence(trend.trend_confidence)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Data Points</span>
                        <span className="font-medium text-gray-900">
                          {trend.data_points_analyzed || 0}
                        </span>
                      </div>
                    </div>

                    {trend.reasoning && (
                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <p className="text-xs font-medium text-pink-900 mb-1">
                          📊 Analysis
                        </p>
                        <p className="text-xs text-pink-800">{trend.reasoning}</p>
                      </div>
                    )}

                    {trend.monthly_growth_rates &&
                      trend.monthly_growth_rates.length > 0 && (
                        <div className="max-h-48 overflow-y-auto">
                          <p className="text-xs font-medium text-gray-700 mb-2">
                            Monthly Growth Rates
                          </p>
                          <div className="space-y-1">
                            {trend.monthly_growth_rates.slice(0, 6).map((rate, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                              >
                                <span className="text-gray-600">{rate.month}</span>
                                <span
                                  className={`font-medium ${
                                    rate.growth_rate > 0
                                      ? 'text-red-600'
                                      : rate.growth_rate < 0
                                      ? 'text-green-600'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {rate.growth_rate > 0 ? '+' : ''}
                                  {rate.growth_rate.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Trend analysis complete</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      {trend.message || 'No trend data available'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!prediction && !seasonal && !trend && !isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Brain className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ready for AI-Powered Predictions
              </h3>
              <p className="text-gray-600 mb-6">
                Select an activity type and target period above, then click "Get Predictions" to see:
              </p>
              <div className="text-left space-y-3 max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Next Value Prediction</p>
                    <p className="text-sm text-gray-600">
                      Forecasted emissions with confidence intervals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Seasonal Patterns</p>
                    <p className="text-sm text-gray-600">
                      Monthly variations and peak/low periods
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-pink-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Growth Trends</p>
                    <p className="text-sm text-gray-600">
                      Long-term trajectory analysis and insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveAnalyticsDemo;
