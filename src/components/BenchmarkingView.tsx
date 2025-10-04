// src/components/BenchmarkingView.tsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Trophy, Target, Lightbulb, 
  RefreshCw, BarChart3, AlertCircle, Award, Users 
} from 'lucide-react';
import { 
  benchmarkingService, 
  PeerComparison, 
  ImprovementOpportunity, 
  IndustryLeader 
} from '../services/benchmarkingService';

interface BenchmarkingViewProps {
  footprintId: string;
  onRefresh?: () => void;
}

const BenchmarkingView: React.FC<BenchmarkingViewProps> = ({ 
  footprintId, 
  onRefresh 
}) => {
  const [comparison, setComparison] = useState<PeerComparison | null>(null);
  const [opportunities, setOpportunities] = useState<ImprovementOpportunity[]>([]);
  const [leaders, setLeaders] = useState<IndustryLeader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBenchmarkingData();
  }, [footprintId]);

  const loadBenchmarkingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [comparisonData, opportunitiesData, leadersData] = await Promise.all([
        benchmarkingService.getPeerComparison(footprintId),
        benchmarkingService.getImprovementOpportunities(footprintId),
        benchmarkingService.getIndustryLeaders()
      ]);
      
      setComparison(comparisonData);
      setOpportunities(opportunitiesData.opportunities);
      setLeaders(leadersData.leaders);
    } catch (err) {
      console.error('Failed to load benchmarking data:', err);
      setError('Failed to load benchmarking data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadBenchmarkingData();
    onRefresh?.();
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Trophy className="w-6 h-6 text-green-500" />;
      case 'good':
        return <TrendingUp className="w-6 h-6 text-blue-500" />;
      case 'needs_improvement':
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      default:
        return <Target className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getPerformanceGradient = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'from-green-500 to-emerald-600';
      case 'good':
        return 'from-blue-500 to-indigo-600';
      case 'needs_improvement':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-yellow-500 to-orange-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading benchmarking data...</p>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error || 'No data available'}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const badge = benchmarkingService.getPerformanceBadge(comparison.comparison.performance);
  const totalSavings = benchmarkingService.calculatePotentialSavings(opportunities);

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className={`bg-gradient-to-br ${getPerformanceGradient(comparison.comparison.performance)} rounded-xl shadow-lg p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Industry Benchmarking</h2>
          <button
            onClick={handleRefresh}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Badge */}
          <div className="text-center">
            <div className="mb-4">
              {getPerformanceIcon(comparison.comparison.performance)}
            </div>
            <div className="text-4xl font-bold mb-2">{badge.label}</div>
            <div className="text-white/80">{badge.icon}</div>
          </div>

          {/* Percentile Ranking */}
          <div className="text-center">
            <div className="text-sm text-white/80 mb-2">Your Ranking</div>
            <div className="text-5xl font-bold mb-2">{comparison.comparison.ranking_percentile}%</div>
            <div className="text-white/80">
              {benchmarkingService.getPercentileText(comparison.comparison.ranking_percentile)}
            </div>
          </div>

          {/* vs Industry Average */}
          <div className="text-center">
            <div className="text-sm text-white/80 mb-2">vs Industry Average</div>
            <div className={`text-4xl font-bold mb-2 ${
              comparison.comparison.total_vs_average < 0 ? 'text-green-200' : 'text-red-200'
            }`}>
              {benchmarkingService.formatPercentage(comparison.comparison.total_vs_average)}
            </div>
            <div className="text-white/80">
              {comparison.comparison.total_vs_average < 0 ? 'Below average ✓' : 'Above average'}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2" />
          Emissions Comparison
        </h3>
        
        <div className="space-y-6">
          {/* Overall Comparison */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Total Emissions</span>
              <span className="text-sm text-gray-500">
                tCO₂e per employee
              </span>
            </div>
            <div className="space-y-2">
              {/* Your Company */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Your Company</span>
                  <span className="font-bold text-gray-900">
                    {comparison.company_emissions.per_employee.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ 
                      width: `${(comparison.company_emissions.per_employee / 
                        Math.max(comparison.company_emissions.per_employee, 
                                comparison.industry_average.total_per_employee) * 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Industry Average */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Industry Average</span>
                  <span className="font-bold text-gray-700">
                    {comparison.industry_average.total_per_employee.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gray-400 h-full rounded-full"
                    style={{ 
                      width: `${(comparison.industry_average.total_per_employee / 
                        Math.max(comparison.company_emissions.per_employee, 
                                comparison.industry_average.total_per_employee) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scope Breakdown */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Breakdown by Scope</h4>
            <div className="space-y-4">
              {/* Scope 1 */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700">Scope 1 (Direct)</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-600 font-medium">
                      You: {comparison.company_emissions.scope1_per_employee.toFixed(2)}
                    </span>
                    <span className="text-gray-500">
                      Avg: {comparison.industry_average.scope1_per_employee.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-200 rounded h-2">
                    <div
                      className="bg-blue-600 h-full rounded"
                      style={{ 
                        width: `${(comparison.company_emissions.scope1_per_employee / 
                          comparison.company_emissions.per_employee * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded h-2">
                    <div
                      className="bg-gray-400 h-full rounded"
                      style={{ 
                        width: `${(comparison.industry_average.scope1_per_employee / 
                          comparison.industry_average.total_per_employee * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Scope 2 */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700">Scope 2 (Energy)</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-600 font-medium">
                      You: {comparison.company_emissions.scope2_per_employee.toFixed(2)}
                    </span>
                    <span className="text-gray-500">
                      Avg: {comparison.industry_average.scope2_per_employee.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-200 rounded h-2">
                    <div
                      className="bg-blue-600 h-full rounded"
                      style={{ 
                        width: `${(comparison.company_emissions.scope2_per_employee / 
                          comparison.company_emissions.per_employee * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded h-2">
                    <div
                      className="bg-gray-400 h-full rounded"
                      style={{ 
                        width: `${(comparison.industry_average.scope2_per_employee / 
                          comparison.industry_average.total_per_employee * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Scope 3 */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700">Scope 3 (Value Chain)</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-600 font-medium">
                      You: {comparison.company_emissions.scope3_per_employee?.toFixed(2) || 'N/A'}
                    </span>
                    <span className="text-gray-500">
                      Avg: {comparison.industry_average.scope3_per_employee?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-200 rounded h-2">
                    <div
                      className="bg-blue-600 h-full rounded"
                      style={{ 
                        width: `${comparison.company_emissions.scope3_per_employee ? 
                          (comparison.company_emissions.scope3_per_employee / 
                          comparison.company_emissions.per_employee * 100) : 0}%` 
                      }}
                    />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded h-2">
                    <div
                      className="bg-gray-400 h-full rounded"
                      style={{ 
                        width: `${comparison.industry_average.scope3_per_employee ? 
                          (comparison.industry_average.scope3_per_employee / 
                          comparison.industry_average.total_per_employee * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {comparison.insights.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2 text-blue-600" />
            Key Insights
          </h3>
          <ul className="space-y-2">
            {comparison.insights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Opportunities */}
      {opportunities.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-2 text-green-600" />
              Improvement Opportunities
            </h3>
            {totalSavings > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {totalSavings.toFixed(2)} tCO₂e
                </div>
                <div className="text-sm text-gray-500">Potential reduction</div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {opportunities.map((opportunity, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{opportunity.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    benchmarkingService.getPriorityColor(opportunity.priority)
                  }`}>
                    {opportunity.priority} priority
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Potential Reduction</span>
                    <div className="font-bold text-green-600">
                      {opportunity.potential_reduction.toFixed(2)} tCO₂e
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Investment</span>
                    <div className="font-bold text-gray-900">{opportunity.estimated_cost}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Payback</span>
                    <div className="font-bold text-blue-600">{opportunity.payback_period}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry Leaders */}
      {leaders.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2 text-amber-600" />
            Industry Leaders
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Top performers in your industry (anonymized)
          </p>

          <div className="space-y-3">
            {leaders.map((leader, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Rank #{leader.rank}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {benchmarkingService.formatPercentage(leader.vs_average)} vs avg
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {leader.emissions_per_employee.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">tCO₂e per employee</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchmarkingView;
