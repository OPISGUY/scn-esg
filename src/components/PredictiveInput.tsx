// src/components/PredictiveInput.tsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, Check, X, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { predictionService } from '../services/predictionService';

interface PredictiveInputProps {
  activityType: string;
  targetPeriod?: string;
  companyId: number;
  onAccept?: (predictedValue: number, confidence: number) => void;
  onReject?: () => void;
  onManualEntry?: (value: number) => void;
  disabled?: boolean;
}

const PredictiveInput: React.FC<PredictiveInputProps> = ({
  activityType,
  targetPeriod,
  companyId,
  onAccept,
  onReject,
  onManualEntry,
  disabled = false,
}) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (activityType && companyId && !disabled) {
      fetchPrediction();
    }
  }, [activityType, targetPeriod, companyId]);

  const fetchPrediction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await predictionService.predictNextValue({
        company_id: companyId,
        activity_type: activityType,
        target_period: targetPeriod || new Date().toISOString().slice(0, 10),
      });
      
      if (result.success && result.predicted_value !== null) {
        setPrediction({
          predicted_value: result.predicted_value,
          confidence: result.confidence_score || 0.5,
          confidence_interval: result.confidence_interval,
          reasoning: result.reasoning,
          factors: [], // Factors not included in API response
          unit: 'tCO₂e',
          historical_average: result.historical_average,
          trend: null, // Trend calculation not in basic response
        });
      } else {
        setError(result.message || 'Unable to generate prediction');
        setPrediction(null);
      }
    } catch (err) {
      console.error('Failed to fetch prediction:', err);
      setError('Failed to load prediction. Please enter manually.');
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (prediction && onAccept) {
      onAccept(prediction.predicted_value, prediction.confidence);
    }
  };

  const handleReject = () => {
    setPrediction(null);
    setShowManualInput(true);
    if (onReject) {
      onReject();
    }
  };

  const handleManualSubmit = () => {
    const value = parseFloat(manualValue);
    if (!isNaN(value) && value >= 0 && onManualEntry) {
      onManualEntry(value);
      setManualValue('');
      setShowManualInput(false);
    }
  };

  const handleRefresh = () => {
    fetchPrediction();
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return '✓';
    if (confidence >= 0.6) return '⚡';
    return '⚠️';
  };

  if (disabled) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <div>
            <div className="font-medium text-blue-900">Loading prediction...</div>
            <div className="text-sm text-blue-600">Analyzing historical patterns</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !showManualInput) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-yellow-900">Unable to predict</div>
            <div className="text-sm text-yellow-700 mb-2">{error}</div>
            <button
              onClick={() => setShowManualInput(true)}
              className="text-sm text-yellow-800 underline hover:text-yellow-900"
            >
              Enter value manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showManualInput || !prediction) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <Sparkles className="w-5 h-5 text-gray-600" />
          <div className="font-medium text-gray-900">Manual Entry</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="Enter value..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
          <button
            onClick={handleManualSubmit}
            disabled={!manualValue || parseFloat(manualValue) < 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
          {prediction && (
            <button
              onClick={() => setShowManualInput(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-lg p-4 mb-4 ${getConfidenceColor(prediction.confidence)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6" />
          <div>
            <div className="font-bold text-lg">
              Predicted: {prediction.predicted_value.toFixed(2)} {prediction.unit || ''}
            </div>
            <div className="text-sm opacity-90">
              {getConfidenceIcon(prediction.confidence)} {getConfidenceLabel(prediction.confidence)}
              {prediction.confidence_interval && (
                <span className="ml-2">
                  (Range: {prediction.confidence_interval.lower.toFixed(2)} - {prediction.confidence_interval.upper.toFixed(2)})
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          title="Refresh prediction"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {prediction.reasoning && (
        <div className="mb-3 text-sm opacity-90">
          <strong>Why:</strong> {prediction.reasoning}
        </div>
      )}

      {prediction.factors && prediction.factors.length > 0 && (
        <div className="mb-3">
          <div className="text-sm font-medium mb-1">Based on:</div>
          <div className="flex flex-wrap gap-2">
            {prediction.factors.map((factor: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/50 rounded-full text-xs"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <button
          onClick={handleAccept}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Accept Prediction</span>
        </button>
        
        <button
          onClick={handleReject}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Enter Manually</span>
        </button>
      </div>

      {prediction.historical_average && (
        <div className="mt-3 pt-3 border-t border-current/20 text-xs opacity-75">
          Historical average: {prediction.historical_average.toFixed(2)}
          {prediction.trend && (
            <span className="ml-2">
              | Trend: {prediction.trend > 0 ? '↗️' : prediction.trend < 0 ? '↘️' : '→'} {(prediction.trend * 100).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictiveInput;
