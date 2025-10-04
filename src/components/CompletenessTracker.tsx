// src/components/CompletenessTracker.tsx
import React, { useState, useEffect } from 'react';
import {
  CheckCircle, AlertCircle, TrendingUp, Target,
  Activity, Zap, Truck, RefreshCw
} from 'lucide-react';
import { guidanceService, CompletenessScore, MissingDataAlert } from '../services/guidanceService';

interface CompletenessTrackerProps {
  footprintId: string;
  onRefresh?: () => void;
}

const CompletenessTracker: React.FC<CompletenessTrackerProps> = ({ 
  footprintId, 
  onRefresh 
}) => {
  const [score, setScore] = useState<CompletenessScore | null>(null);
  const [alerts, setAlerts] = useState<MissingDataAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompletenessData();
  }, [footprintId]);

  const loadCompletenessData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [scoreData, alertsData] = await Promise.all([
        guidanceService.getCompletenessScore(footprintId),
        guidanceService.getMissingDataAlerts(footprintId)
      ]);
      
      setScore(scoreData);
      setAlerts(alertsData.alerts);
    } catch (err) {
      console.error('Failed to load completeness data:', err);
      setError('Failed to load completeness data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCompletenessData();
    onRefresh?.();
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-blue-100 text-blue-700 border-blue-300'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[priority as keyof typeof colors] || colors.low}`}>
        {priority}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading completeness data...</p>
        </div>
      </div>
    );
  }

  if (error || !score) {
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

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className={`rounded-xl border-2 p-6 ${getScoreBg(score.overall_score)}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Data Completeness</h2>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(score.overall_score)}`}>
              {Math.round(score.overall_score)}%
            </div>
            <div className="text-gray-600 mb-2">Overall Score</div>
            <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
              guidanceService.getGradeColor(score.grade)
            } bg-white`}>
              Grade {score.grade}
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={score.overall_score >= 90 ? '#10b981' : score.overall_score >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${score.overall_score * 2.51} 251`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className={`w-12 h-12 ${getScoreColor(score.overall_score)}`} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completion</span>
              <span className="font-bold text-gray-900">{Math.round(score.completion_percentage)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Missing</span>
              <span className="font-bold text-red-600">{score.missing_activities.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Minimum Met</span>
              <span className="font-bold text-green-600">{score.meets_minimum ? 'Yes' : 'No'}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                {score.overall_score >= 90 ? 'Excellent coverage!' : 
                 score.overall_score >= 60 ? 'Good progress!' : 
                 'Keep going!'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Coverage by Scope</h3>
        <div className="space-y-6">
          {/* Scope 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span className="font-medium text-gray-900">Scope 1: Direct Emissions</span>
              </div>
              <span className={`font-bold ${getScoreColor(score.scope1_score)}`}>
                {Math.round(score.scope1_score)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(score.scope1_score)}`}
                style={{ width: `${score.scope1_score}%` }}
              />
            </div>
            {score.missing_by_scope.scope1.length > 0 && (
              <div className="ml-7 mt-2">
                <p className="text-sm text-gray-500 mb-1">Missing activities:</p>
                <div className="flex flex-wrap gap-2">
                  {score.missing_by_scope.scope1.map((activity: string) => (
                    <span
                      key={activity}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {guidanceService.formatActivityName(activity)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scope 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span className="font-medium text-gray-900">Scope 2: Indirect Emissions</span>
              </div>
              <span className={`font-bold ${getScoreColor(score.scope2_score)}`}>
                {Math.round(score.scope2_score)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(score.scope2_score)}`}
                style={{ width: `${score.scope2_score}%` }}
              />
            </div>
            {score.missing_by_scope.scope2.length > 0 && (
              <div className="ml-7 mt-2">
                <p className="text-sm text-gray-500 mb-1">Missing activities:</p>
                <div className="flex flex-wrap gap-2">
                  {score.missing_by_scope.scope2.map((activity: string) => (
                    <span
                      key={activity}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {guidanceService.formatActivityName(activity)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scope 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span className="font-medium text-gray-900">Scope 3: Value Chain</span>
              </div>
              <span className={`font-bold ${getScoreColor(score.scope3_score)}`}>
                {Math.round(score.scope3_score)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(score.scope3_score)}`}
                style={{ width: `${score.scope3_score}%` }}
              />
            </div>
            {score.missing_by_scope.scope3.length > 0 && (
              <div className="ml-7 mt-2">
                <p className="text-sm text-gray-500 mb-1">Missing activities:</p>
                <div className="flex flex-wrap gap-2">
                  {score.missing_by_scope.scope3.map((activity: string) => (
                    <span
                      key={activity}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {guidanceService.formatActivityName(activity)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Missing Data Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Missing Data Alerts</h3>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
              {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className={`w-5 h-5 ${
                      alert.priority === 'high' ? 'text-red-500' :
                      alert.priority === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <h4 className="font-medium text-gray-900">
                      {guidanceService.formatActivityName(alert.activity)}
                    </h4>
                  </div>
                  {getPriorityBadge(alert.priority)}
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                
                {alert.suggestion && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-gray-700">
                    <strong>Suggestion:</strong> {alert.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {score.overall_score >= 90 && alerts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Outstanding Data Coverage!
          </h3>
          <p className="text-green-700">
            Your carbon footprint data is comprehensive and complete. 
            Keep up the great work maintaining this high standard!
          </p>
        </div>
      )}
    </div>
  );
};

export default CompletenessTracker;
