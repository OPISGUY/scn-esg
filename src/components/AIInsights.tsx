import React, { useState } from 'react';
import { 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Lightbulb,
  TrendingUp,
  BarChart3,
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import { useCarbonFootprint } from '../contexts/CarbonFootprintContext';

interface ValidationResult {
  validation_score: number;
  anomalies: Array<{
    field: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggested_value?: number;
  }>;
  data_quality_issues: string[];
  recommendations: string[];
  company_name?: string;
  reporting_period?: string;
}

interface BenchmarkResult {
  percentile_ranking: number;
  industry_average: number;
  performance_vs_average: number;
  improvement_opportunities: string[];
  company_name?: string;
  industry?: string;
}

interface ActionPlan {
  quick_wins: Array<{
    action: string;
    co2_reduction: number;
    cost: string;
    timeline: string;
  }>;
  medium_term: Array<{
    action: string;
    co2_reduction: number;
    cost: string;
    timeline: string;
  }>;
  long_term: Array<{
    action: string;
    co2_reduction: number;
    cost: string;
    timeline: string;
  }>;
}

const AIInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'validation' | 'benchmark' | 'actionplan'>('validation');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);

  const callAIService = async (endpoint: string, data?: any) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(buildApiUrl(`/api/v1/carbon/ai/${endpoint}/`), {
        method: data ? 'POST' : 'GET',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `AI service error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('AI service call failed:', err);
      throw err;
    }
  };

  const { currentFootprint } = useCarbonFootprint();

  const validateData = async () => {
    setLoading(prev => ({ ...prev, validation: true }));
    setError(null);
    
    try {
      if (!currentFootprint) {
        throw new Error('No carbon footprint data available. Please calculate your emissions first.');
      }

      // Send current footprint data to AI for validation
      const result = await callAIService('validate', {
        footprint_id: currentFootprint.id,
        scope1: currentFootprint.scope1_emissions,
        scope2: currentFootprint.scope2_emissions,
        scope3: currentFootprint.scope3_emissions,
        total: currentFootprint.total_emissions
      });
      
      if (result && typeof result === 'object') {
        setValidationResult(result);
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to validate data. Please ensure you have carbon footprint data.';
      setError(errorMessage);
      console.error('Validation error:', err);
      // Don't crash - just show the error
      setValidationResult(null);
    } finally {
      setLoading(prev => ({ ...prev, validation: false }));
    }
  };

  const getBenchmark = async () => {
    setLoading(prev => ({ ...prev, benchmark: true }));
    setError(null);
    
    try {
      const result = await callAIService('benchmark');
      if (result && typeof result === 'object') {
        setBenchmarkResult(result);
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get benchmark data. Please ensure your company has emission data.';
      setError(errorMessage);
      console.error('Benchmark error:', err);
      // Don't crash - just show the error
      setBenchmarkResult(null);
    } finally {
      setLoading(prev => ({ ...prev, benchmark: false }));
    }
  };

  const generateActionPlan = async () => {
    setLoading(prev => ({ ...prev, actionplan: true }));
    setError(null);
    
    try {
      const result = await callAIService('action-plan');
      setActionPlan(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate action plan. Please ensure your company has emission data.');
      console.error('Action plan error:', err);
    } finally {
      setLoading(prev => ({ ...prev, actionplan: false }));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <CheckCircle2 className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Brain className="w-8 h-8" />
          <h1 className="text-3xl font-bold">AI-Powered ESG Insights</h1>
        </div>
        <p className="text-lg text-blue-100">
          Get intelligent recommendations, validation, and actionable insights powered by advanced AI
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'validation', label: 'Data Validation', icon: CheckCircle2 },
              { id: 'benchmark', label: 'Benchmarking', icon: BarChart3 },
              { id: 'actionplan', label: 'Action Plan', icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Data Validation Tab */}
          {activeTab === 'validation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">AI Data Validation</h2>
                <button
                  onClick={validateData}
                  disabled={loading.validation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading.validation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Validate Data
                </button>
              </div>

              {validationResult && (
                <div className="space-y-4">
                  {/* Validation Score */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Data Quality Score</span>
                      <span className="text-2xl font-bold text-green-600">
                        {validationResult.validation_score ?? 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${validationResult.validation_score ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Anomalies */}
                  {validationResult.anomalies && validationResult.anomalies.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Detected Anomalies</h3>
                      <div className="space-y-2">
                        {validationResult.anomalies.map((anomaly, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityIcon(anomaly.severity)}
                              <span className="font-medium capitalize">{anomaly.severity} Severity</span>
                            </div>
                            <p className="text-sm">{anomaly.message}</p>
                            {anomaly.suggested_value && (
                              <p className="text-xs mt-1 opacity-75">
                                Suggested value: {anomaly.suggested_value} tCO₂e
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">AI Recommendations</h3>
                    <div className="space-y-2">
                      {validationResult.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Benchmarking Tab */}
          {activeTab === 'benchmark' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Industry Benchmarking</h2>
                <button
                  onClick={getBenchmark}
                  disabled={loading.benchmark}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading.benchmark ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  Get Benchmark
                </button>
              </div>

              {benchmarkResult && (
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {benchmarkResult.percentile_ranking ?? 'N/A'}%
                      </div>
                      <div className="text-sm text-gray-600">Percentile Ranking</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {benchmarkResult.performance_vs_average !== undefined && benchmarkResult.performance_vs_average !== null ? (
                          <>
                            {benchmarkResult.performance_vs_average > 0 ? '+' : ''}
                            {benchmarkResult.performance_vs_average.toFixed(1)}%
                          </>
                        ) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">vs Industry Average</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-600">
                        {benchmarkResult.industry_average?.toLocaleString() ?? 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Industry Average (tCO₂e)</div>
                    </div>
                  </div>

                  {/* Improvement Opportunities */}
                  {benchmarkResult.improvement_opportunities && benchmarkResult.improvement_opportunities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Improvement Opportunities</h3>
                      <div className="space-y-2">
                        {benchmarkResult.improvement_opportunities.map((opportunity, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                            <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-green-800">{opportunity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Plan Tab */}
          {activeTab === 'actionplan' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">AI-Generated Action Plan</h2>
                <button
                  onClick={generateActionPlan}
                  disabled={loading.actionplan}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading.actionplan ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Target className="w-4 h-4" />
                  )}
                  Generate Plan
                </button>
              </div>

              {actionPlan && (
                <div className="space-y-6">
                  {/* Quick Wins */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Quick Wins (0-6 months)
                    </h3>
                    <div className="space-y-3">
                      {actionPlan.quick_wins.map((action, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{action.action}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCostColor(action.cost)}`}>
                              {action.cost} Cost
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>💚 {action.co2_reduction} tCO₂e reduction</span>
                            <span>⏱️ {action.timeline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medium Term */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      Medium-term (6-18 months)
                    </h3>
                    <div className="space-y-3">
                      {actionPlan.medium_term.map((action, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{action.action}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCostColor(action.cost)}`}>
                              {action.cost} Cost
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>💚 {action.co2_reduction} tCO₂e reduction</span>
                            <span>⏱️ {action.timeline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Long Term */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Long-term (1-3 years)
                    </h3>
                    <div className="space-y-3">
                      {actionPlan.long_term.map((action, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{action.action}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCostColor(action.cost)}`}>
                              {action.cost} Cost
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>💚 {action.co2_reduction} tCO₂e reduction</span>
                            <span>⏱️ {action.timeline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
