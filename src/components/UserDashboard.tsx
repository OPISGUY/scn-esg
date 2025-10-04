import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  FileText,
  Leaf,
  Target,
  Activity,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { carbonService, CarbonFootprintData } from '../services/carbonService';

interface UserDashboardProps {
  onViewChange: (view: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [footprints, setFootprints] = useState<CarbonFootprintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carbonService.getFootprints();
      // Ensure data is always an array
      const footprintsArray = Array.isArray(data) ? data : [];
      
      // If API returns empty, try localStorage fallback for demo mode
      if (footprintsArray.length === 0) {
        const savedFootprint = localStorage.getItem('carbonFootprint');
        if (savedFootprint) {
          try {
            const parsed = JSON.parse(savedFootprint);
            // Convert to API format if needed
            const localFootprint = {
              id: parsed.id || '1',
              reporting_period: parsed.reportingPeriod || parsed.reporting_period || '2024',
              scope1_emissions: parsed.scope1 || parsed.scope1_emissions || 0,
              scope2_emissions: parsed.scope2 || parsed.scope2_emissions || 0,
              scope3_emissions: parsed.scope3 || parsed.scope3_emissions || 0,
              total_emissions: parsed.total || parsed.total_emissions || 0,
              company_data: {
                id: 1,
                name: parsed.companyName || 'Demo Company'
              },
              status: parsed.status || 'draft' as const
            };
            setFootprints([localFootprint]);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing localStorage footprint:', parseError);
          }
        }
      } else {
        setFootprints(footprintsArray);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      // Try localStorage fallback on error
      const savedFootprint = localStorage.getItem('carbonFootprint');
      if (savedFootprint) {
        try {
          const parsed = JSON.parse(savedFootprint);
          const localFootprint = {
            id: parsed.id || '1',
            reporting_period: parsed.reportingPeriod || parsed.reporting_period || '2024',
            scope1_emissions: parsed.scope1 || parsed.scope1_emissions || 0,
            scope2_emissions: parsed.scope2 || parsed.scope2_emissions || 0,
            scope3_emissions: parsed.scope3 || parsed.scope3_emissions || 0,
            total_emissions: parsed.total || parsed.total_emissions || 0,
            company_data: {
              id: 1,
              name: parsed.companyName || 'Demo Company'
            },
            status: parsed.status || 'draft' as const
          };
          setFootprints([localFootprint]);
        } catch (parseError) {
          console.error('Error parsing localStorage footprint:', parseError);
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
          setFootprints([]); // Set empty array on error
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        setFootprints([]); // Set empty array on error
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary metrics - with safety checks
  const footprintsArray = Array.isArray(footprints) ? footprints : [];
  const latestFootprint = footprintsArray[0];
  const totalEmissions = footprintsArray.reduce((sum, fp) => sum + (fp.total_emissions || 0), 0);
  const avgEmissions = footprintsArray.length > 0 ? totalEmissions / footprintsArray.length : 0;

  // Calculate trend
  const trend = footprintsArray.length >= 2
    ? ((footprintsArray[0].total_emissions || 0) - (footprintsArray[1].total_emissions || 0)) / (footprintsArray[1].total_emissions || 1) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (footprintsArray.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-300">
          <Leaf className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Carbon Dashboard!</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            You haven't created any carbon footprints yet. Get started by entering your emissions data
            using our Carbon Calculator or Smart Data Entry tools.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onViewChange('carbon-calculator')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Start Carbon Calculator
            </button>
            <button
              onClick={() => onViewChange('conversational')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Try Smart Data Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Your Carbon Dashboard</h1>
        <p className="text-blue-100">
          Welcome back, {user?.first_name || 'User'}! Here's your complete sustainability overview.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            {trend !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(trend).toFixed(1)}%
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Latest Emissions</h3>
          <p className="text-2xl font-bold text-gray-900">
            {(Number(latestFootprint?.total_emissions) || 0).toFixed(2)} <span className="text-lg text-gray-500">tCO₂e</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">{latestFootprint?.reporting_period || 'N/A'}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Average Emissions</h3>
          <p className="text-2xl font-bold text-gray-900">
            {(Number(avgEmissions) || 0).toFixed(2)} <span className="text-lg text-gray-500">tCO₂e</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">Across {footprintsArray.length} periods</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Records</h3>
          <p className="text-2xl font-bold text-gray-900">{footprintsArray.length}</p>
          <p className="text-xs text-gray-500 mt-2">Carbon footprints tracked</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Status</h3>
          <p className="text-2xl font-bold text-gray-900 capitalize">{latestFootprint?.status || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-2">Current footprint</p>
        </div>
      </div>

      {/* Emissions Breakdown */}
      {latestFootprint && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Latest Emissions Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Scope 1 (Direct)</span>
                <span className="text-sm text-gray-500">
                  {latestFootprint.total_emissions && latestFootprint.total_emissions > 0 ? ((latestFootprint.scope1_emissions / latestFootprint.total_emissions) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-red-500 h-3 rounded-full"
                  style={{ width: `${(latestFootprint.scope1_emissions / latestFootprint.total_emissions!) * 100}%` }}
                />
              </div>
              <p className="text-2xl font-bold text-gray-900">{(Number(latestFootprint.scope1_emissions) || 0).toFixed(2)} tCO₂e</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Scope 2 (Electricity)</span>
                <span className="text-sm text-gray-500">
                  {latestFootprint.total_emissions && latestFootprint.total_emissions > 0 ? ((latestFootprint.scope2_emissions / latestFootprint.total_emissions) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-orange-500 h-3 rounded-full"
                  style={{ width: `${(latestFootprint.scope2_emissions / latestFootprint.total_emissions!) * 100}%` }}
                />
              </div>
              <p className="text-2xl font-bold text-gray-900">{(Number(latestFootprint.scope2_emissions) || 0).toFixed(2)} tCO₂e</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Scope 3 (Indirect)</span>
                <span className="text-sm text-gray-500">
                  {latestFootprint.total_emissions && latestFootprint.total_emissions > 0 ? ((latestFootprint.scope3_emissions / latestFootprint.total_emissions) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-yellow-500 h-3 rounded-full"
                  style={{ width: `${(latestFootprint.scope3_emissions / latestFootprint.total_emissions!) * 100}%` }}
                />
              </div>
              <p className="text-2xl font-bold text-gray-900">{(Number(latestFootprint.scope3_emissions) || 0).toFixed(2)} tCO₂e</p>
            </div>
          </div>
        </div>
      )}

      {/* Historical Data */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Historical Footprints</h2>
          <button
            onClick={() => onViewChange('carbon-calculator')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Add New
          </button>
        </div>

        <div className="space-y-4">
          {footprintsArray.map((footprint) => (
            <div key={footprint.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {footprint.reporting_period?.split('-')[0]?.slice(-2) || 'N/A'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{footprint.reporting_period || 'Unknown Period'}</h3>
                    <p className="text-sm text-gray-500">Created: {new Date(footprint.created_at!).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{footprint.total_emissions?.toFixed(2)} tCO₂e</p>
                  <div className="flex items-center gap-2 mt-1">
                    {footprint.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded capitalize">
                        {footprint.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Scope 1</p>
                  <p className="text-sm font-semibold text-red-600">{footprint.scope1_emissions.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Scope 2</p>
                  <p className="text-sm font-semibold text-orange-600">{footprint.scope2_emissions.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Scope 3</p>
                  <p className="text-sm font-semibold text-yellow-600">{footprint.scope3_emissions.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onViewChange('ai-insights')}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white text-left hover:shadow-xl transition-all"
        >
          <Target className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-2">AI Insights</h3>
          <p className="text-sm text-purple-100">Get AI-powered recommendations</p>
        </button>

        <button
          onClick={() => onViewChange('offset-marketplace')}
          className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-white text-left hover:shadow-xl transition-all"
        >
          <Leaf className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-2">Offset Marketplace</h3>
          <p className="text-sm text-green-100">Purchase carbon offsets</p>
        </button>

        <button
          onClick={() => onViewChange('compliance')}
          className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white text-left hover:shadow-xl transition-all"
        >
          <CheckCircle className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-2">Compliance</h3>
          <p className="text-sm text-blue-100">Check reporting requirements</p>
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
