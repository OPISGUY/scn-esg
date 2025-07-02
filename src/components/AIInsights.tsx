import React, { useState, useEffect } from 'react';
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

  const mockFootprintId = "mock-footprint-123"; // In real app, this would come from props or context

  const callAIService = async (endpoint: string, data?: any) => {
    try {
      const response = await fetch(`/api/v1/carbon/ai/${endpoint}/`, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          // In real app, add Authorization header
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('AI service call failed:', err);
      throw err;
    }
  };

  const validateData = async () => {
    setLoading(prev => ({ ...prev, validation: true }));
    setError(null);
    
    try {
      const result = await callAIService('validate', { footprint_id: mockFootprintId });
      setValidationResult(result);
    } catch (err) {
      setError('Failed to validate data. Using mock results for demo.');
      // Use mock data for demo
      setValidationResult({
        validation_score: 85,
        anomalies: [
          {
            field: "scope1_emissions",
            severity: "medium",
            message: "Scope 1 emissions seem high for company size",
            suggested_value: 1200.50
          }
        ],
        data_quality_issues: [
          "Consider adding more detailed activity data"
        ],
        recommendations: [
          "Review fuel consumption calculations",
          "Verify emission factors used"
        ],
        company_name: "Example Corp",
        reporting_period: "2024"
      });
    } finally {
      setLoading(prev => ({ ...prev, validation: false }));
    }
  };

  const getBenchmark = async () => {
    setLoading(prev => ({ ...prev, benchmark: true }));
    setError(null);
    
    try {
      const result = await callAIService('benchmark');
      setBenchmarkResult(result);
    } catch (err) {
      setError('Failed to get benchmark. Using mock results for demo.');
      // Use mock data for demo
      setBenchmarkResult({
        percentile_ranking: 65,
        industry_average: 2500.75,
        performance_vs_average: -15.2,
        improvement_opportunities: [
          "Energy efficiency improvements could reduce emissions by 20%",
          "Renewable energy adoption could cut Scope 2 by 40%"
        ],
        company_name: "Example Corp",
        industry: "Technology"
      });
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
    } catch (err) {
      setError('Failed to generate action plan. Using mock results for demo.');
      // Use mock data for demo
      setActionPlan({
        quick_wins: [
          {
            action: "Switch to LED lighting",
            co2_reduction: 50.5,
            cost: "Low",
            timeline: "3 months"
          }
        ],
        medium_term: [
          {
            action: "Install solar panels",
            co2_reduction: 200.0,
            cost: "Medium",
            timeline: "12 months"
          }
        ],
        long_term: [
          {
            action: "Electrify vehicle fleet",
            co2_reduction: 300.0,
            cost: "High",
            timeline: "24 months"
          }
        ]
      });
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Demo Mode</span>
          </div>
          <p className="text-yellow-700 mt-1">{error}</p>
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
                        {validationResult.validation_score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${validationResult.validation_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Anomalies */}
                  {validationResult.anomalies.length > 0 && (
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
                        {benchmarkResult.percentile_ranking}%
                      </div>
                      <div className="text-sm text-gray-600">Percentile Ranking</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {benchmarkResult.performance_vs_average > 0 ? '+' : ''}
                        {benchmarkResult.performance_vs_average.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">vs Industry Average</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-600">
                        {benchmarkResult.industry_average.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Industry Average (tCO₂e)</div>
                    </div>
                  </div>

                  {/* Improvement Opportunities */}
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
