import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { CarbonFootprintData } from '../services/carbonService';

interface EmissionsChartsProps {
  footprints: CarbonFootprintData[];
}

const COLORS = {
  scope1: '#ef4444', // red
  scope2: '#f59e0b', // amber
  scope3: '#3b82f6', // blue
  total: '#10b981',  // green
};

export const EmissionsCharts: React.FC<EmissionsChartsProps> = ({ footprints }) => {
  if (footprints.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <p className="text-gray-700 font-medium">No data available for visualization</p>
        <p className="text-sm text-gray-600 mt-2">
          Save your first carbon footprint to see trend analysis and charts.
        </p>
      </div>
    );
  }

  // Sort footprints by date for timeline chart
  const sortedFootprints = [...footprints].sort((a, b) => {
    return new Date(a.reporting_period).getTime() - new Date(b.reporting_period).getTime();
  });

  // Prepare data for trend line chart
  const trendData = sortedFootprints.map((fp) => ({
    period: new Date(fp.reporting_period).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }),
    'Scope 1': Number(fp.scope1_emissions.toFixed(2)),
    'Scope 2': Number(fp.scope2_emissions.toFixed(2)),
    'Scope 3': Number(fp.scope3_emissions.toFixed(2)),
    'Total': Number((fp.total_emissions || 0).toFixed(2)),
  }));

  // Get latest footprint for scope breakdown
  const latestFootprint = sortedFootprints[sortedFootprints.length - 1];
  
  // Prepare data for bar chart (scope comparison)
  const scopeComparisonData = [
    {
      name: 'Scope 1',
      emissions: Number(latestFootprint.scope1_emissions.toFixed(2)),
      fill: COLORS.scope1,
    },
    {
      name: 'Scope 2',
      emissions: Number(latestFootprint.scope2_emissions.toFixed(2)),
      fill: COLORS.scope2,
    },
    {
      name: 'Scope 3',
      emissions: Number(latestFootprint.scope3_emissions.toFixed(2)),
      fill: COLORS.scope3,
    },
  ];

  // Prepare data for pie chart
  const pieData = [
    { 
      name: 'Scope 1 (Direct)', 
      value: Number(latestFootprint.scope1_emissions.toFixed(2)),
      color: COLORS.scope1 
    },
    { 
      name: 'Scope 2 (Electricity)', 
      value: Number(latestFootprint.scope2_emissions.toFixed(2)),
      color: COLORS.scope2 
    },
    { 
      name: 'Scope 3 (Indirect)', 
      value: Number(latestFootprint.scope3_emissions.toFixed(2)),
      color: COLORS.scope3 
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-1">{payload[0].payload.period || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} tCO₂e
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Emissions Trend Over Time */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Emissions Trend Over Time</h3>
            <p className="text-sm text-gray-600">Historical carbon footprint by scope</p>
          </div>
        </div>
        
        {trendData.length > 1 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="period" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="Scope 1" 
                stroke={COLORS.scope1} 
                strokeWidth={2}
                dot={{ fill: COLORS.scope1, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Scope 2" 
                stroke={COLORS.scope2} 
                strokeWidth={2}
                dot={{ fill: COLORS.scope2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Scope 3" 
                stroke={COLORS.scope3} 
                strokeWidth={2}
                dot={{ fill: COLORS.scope3, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Total" 
                stroke={COLORS.total} 
                strokeWidth={3}
                dot={{ fill: COLORS.total, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Add more footprint records to see trend analysis</p>
            <p className="text-sm mt-2">At least 2 data points are required for a trend chart</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Scope Comparison Bar Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Scope Breakdown</h3>
              <p className="text-sm text-gray-600">Latest reporting period</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scopeComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="emissions" 
                fill="#8884d8"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Emissions Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <PieIcon className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Emissions Distribution</h3>
              <p className="text-sm text-gray-600">By scope category</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(1)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Records</p>
            <p className="text-2xl font-bold text-gray-900">{footprints.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Latest Total</p>
            <p className="text-2xl font-bold text-green-600">
              {(latestFootprint.total_emissions || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">tCO₂e</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Highest Scope</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestFootprint.scope1_emissions > latestFootprint.scope2_emissions && 
               latestFootprint.scope1_emissions > latestFootprint.scope3_emissions ? 'Scope 1' :
               latestFootprint.scope2_emissions > latestFootprint.scope3_emissions ? 'Scope 2' : 'Scope 3'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Latest Period</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(latestFootprint.reporting_period).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
