/**
 * LiveFootprintPreview Component
 * Shows real-time carbon footprint updates with visual diff and confidence indicators
 */

import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface FootprintData {
  scope1_emissions: number;
  scope2_emissions: number;
  scope3_emissions: number;
  total_emissions: number;
}

interface PendingChange {
  field: 'scope1_emissions' | 'scope2_emissions' | 'scope3_emissions';
  operation: 'add' | 'set' | 'subtract';
  value: number;
  confidence: number;
  activity_type?: string;
}

interface LiveFootprintPreviewProps {
  currentFootprint: FootprintData;
  pendingChanges?: PendingChange[];
  onAcceptChange?: (change: PendingChange) => void;
  onRejectChange?: (change: PendingChange) => void;
  className?: string;
}

const LiveFootprintPreview: React.FC<LiveFootprintPreviewProps> = ({
  currentFootprint,
  pendingChanges = [],
  onAcceptChange,
  onRejectChange,
  className = '',
}) => {
  // Calculate proposed values
  const calculateProposedValue = (
    field: 'scope1_emissions' | 'scope2_emissions' | 'scope3_emissions'
  ): number => {
    let value = currentFootprint[field];
    
    pendingChanges
      .filter(change => change.field === field)
      .forEach(change => {
        switch (change.operation) {
          case 'add':
            value += change.value;
            break;
          case 'subtract':
            value -= change.value;
            break;
          case 'set':
            value = change.value;
            break;
        }
      });
    
    return value;
  };

  const proposedScope1 = calculateProposedValue('scope1_emissions');
  const proposedScope2 = calculateProposedValue('scope2_emissions');
  const proposedScope3 = calculateProposedValue('scope3_emissions');
  const proposedTotal = proposedScope1 + proposedScope2 + proposedScope3;

  const hasChanges = pendingChanges.length > 0;

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.9) return 'High Confidence';
    if (confidence >= 0.7) return 'Medium Confidence';
    return 'Low Confidence';
  };

  // Render individual scope row
  const renderScopeRow = (
    label: string,
    scopeNumber: 1 | 2 | 3,
    current: number,
    proposed: number
  ) => {
    const field = `scope${scopeNumber}_emissions` as 'scope1_emissions' | 'scope2_emissions' | 'scope3_emissions';
    const change = proposed - current;
    const hasChange = Math.abs(change) > 0.01;
    const relevantChanges = pendingChanges.filter(c => c.field === field);

    return (
      <div className={`p-4 rounded-lg border-2 transition-all ${hasChange ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
          {hasChange && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change > 0 ? '+' : ''}{change.toFixed(2)} tCO₂e</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${hasChange ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {current.toFixed(2)}
          </span>
          {hasChange && (
            <>
              <span className="text-gray-400">→</span>
              <span className="text-2xl font-bold text-blue-600">
                {proposed.toFixed(2)}
              </span>
            </>
          )}
          <span className="text-sm text-gray-500">tCO₂e</span>
        </div>

        {/* Show pending changes for this scope */}
        {relevantChanges.length > 0 && (
          <div className="mt-3 space-y-2">
            {relevantChanges.map((change, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${getConfidenceColor(change.confidence)}`}>
                    {(change.confidence * 100).toFixed(0)}% {getConfidenceLabel(change.confidence)}
                  </div>
                  <span className="text-xs text-gray-600">
                    {change.operation === 'add' ? '+' : change.operation === 'subtract' ? '-' : '='}
                    {change.value.toFixed(2)} tCO₂e
                    {change.activity_type && ` (${change.activity_type})`}
                  </span>
                </div>
                
                {(onAcceptChange || onRejectChange) && (
                  <div className="flex gap-1">
                    {onAcceptChange && (
                      <button
                        onClick={() => onAcceptChange(change)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Accept"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {onRejectChange && (
                      <button
                        onClick={() => onRejectChange(change)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Reject"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Live Footprint Preview</h3>
        {hasChanges && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            <Info className="w-4 h-4" />
            <span>{pendingChanges.length} pending change{pendingChanges.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Total Emissions */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
        <div className="text-sm font-medium text-gray-600 mb-2">Total Emissions</div>
        <div className="flex items-baseline gap-3">
          <span className={`text-4xl font-bold ${hasChanges ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {currentFootprint.total_emissions.toFixed(2)}
          </span>
          {hasChanges && (
            <>
              <span className="text-2xl text-gray-400">→</span>
              <span className="text-4xl font-bold text-blue-600">
                {proposedTotal.toFixed(2)}
              </span>
            </>
          )}
          <span className="text-lg text-gray-500">tCO₂e</span>
        </div>
        
        {hasChanges && (
          <div className="mt-3 flex items-center gap-2">
            {proposedTotal > currentFootprint.total_emissions ? (
              <TrendingUp className="w-5 h-5 text-red-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-green-500" />
            )}
            <span className={`text-sm font-medium ${proposedTotal > currentFootprint.total_emissions ? 'text-red-600' : 'text-green-600'}`}>
              {proposedTotal > currentFootprint.total_emissions ? '+' : ''}
              {(proposedTotal - currentFootprint.total_emissions).toFixed(2)} tCO₂e
              {' '}
              ({((proposedTotal - currentFootprint.total_emissions) / currentFootprint.total_emissions * 100).toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      {/* Scope Breakdown */}
      <div className="space-y-3">
        {renderScopeRow('Scope 1: Direct Emissions', 1, currentFootprint.scope1_emissions, proposedScope1)}
        {renderScopeRow('Scope 2: Electricity', 2, currentFootprint.scope2_emissions, proposedScope2)}
        {renderScopeRow('Scope 3: Indirect', 3, currentFootprint.scope3_emissions, proposedScope3)}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>How it works:</strong> As you chat with the AI, proposed changes appear here in real-time.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Green badges (90%+): High confidence - safe to accept</li>
              <li>Yellow badges (70-89%): Medium confidence - review recommended</li>
              <li>Red badges (&lt;70%): Low confidence - verify before accepting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFootprintPreview;
