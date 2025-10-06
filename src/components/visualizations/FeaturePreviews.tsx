import { motion } from 'framer-motion';
import { Brain, FileText, TrendingUp, AlertCircle } from 'lucide-react';

/**
 * AIInsightsPreview - Visual preview of AI insights feature
 */
export function AIInsightsPreview() {
  const insights = [
    {
      priority: 'High',
      title: 'Scope 3 Optimization Opportunity',
      description: 'Your supply chain emissions could be reduced by 15% through vendor consolidation',
      impact: '+15% reduction',
      color: 'red'
    },
    {
      priority: 'Medium',
      title: 'Renewable Energy Transition',
      description: 'Switch to green energy provider for £2,400/year savings and 20 tonnes CO₂ reduction',
      impact: '20t CO₂',
      color: 'amber'
    },
    {
      priority: 'Low',
      title: 'E-Waste Recycling Program',
      description: 'Partner with local recycler to improve circular economy score by 8%',
      impact: '+8% score',
      color: 'green'
    }
  ];

  const colorMap = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
          3 New Recommendations
        </span>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const colors = colorMap[insight.color as keyof typeof colorMap];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs ${colors.badge} ${colors.text} px-2 py-1 rounded font-semibold`}>
                  {insight.priority} Priority
                </span>
                <span className="text-sm font-bold text-gray-900">{insight.impact}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{insight.title}</h4>
              <p className="text-sm text-gray-600">{insight.description}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
      >
        View All Insights →
      </motion.button>
    </div>
  );
}

/**
 * CSRDCompliancePreview - Visual preview of CSRD compliance tracking
 */
export function CSRDCompliancePreview() {
  const categories = [
    { name: 'Environmental', datapoints: 47, total: 52, percentage: 90 },
    { name: 'Social', datapoints: 38, total: 42, percentage: 90 },
    { name: 'Governance', datapoints: 29, total: 31, percentage: 94 },
    { name: 'Strategy', datapoints: 15, total: 18, percentage: 83 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-emerald-600" />
        <h3 className="text-xl font-bold text-gray-900">CSRD Compliance</h3>
        <span className="ml-auto text-2xl font-bold text-emerald-600">89%</span>
      </div>

      <div className="space-y-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
              <span className="text-xs text-gray-500">
                {cat.datapoints}/{cat.total} datapoints
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percentage}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">11 datapoints remaining</p>
          <p className="text-xs text-blue-700 mt-1">Complete by Q4 2025 for full CSRD compliance</p>
        </div>
      </div>
    </div>
  );
}

/**
 * CarbonTrendPreview - Visual preview of carbon tracking
 */
export function CarbonTrendPreview() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = [285, 270, 265, 258, 250, 245];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-900">Carbon Emissions</h3>
        <span className="ml-auto text-sm text-green-600 font-semibold">↓ 14% YTD</span>
      </div>

      <div className="flex items-end gap-2 h-48 mb-4">
        {data.map((value, index) => {
          const height = (value / Math.max(...data)) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t relative group"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {value}t CO₂e
                </div>
              </motion.div>
              <span className="text-xs text-gray-500">{months[index]}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">245</div>
          <div className="text-xs text-gray-500">Current Month</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">-40t</div>
          <div className="text-xs text-gray-500">vs Last Year</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">220</div>
          <div className="text-xs text-gray-500">2025 Target</div>
        </div>
      </div>
    </div>
  );
}
