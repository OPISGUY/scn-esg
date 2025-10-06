import { motion } from 'framer-motion';
import { TrendingDown, Leaf, CheckCircle, AlertCircle, BarChart3, Activity } from 'lucide-react';

/**
 * DashboardPreview - Animated dashboard visualization for hero section
 * Shows a realistic preview of the platform's main dashboard
 */
export default function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.8 }}
      className="relative mx-auto max-w-6xl"
    >
      {/* Browser Window Frame */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Browser Chrome */}
        <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white rounded px-3 py-1 text-xs text-gray-500 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              app.verdant.scn.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 min-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ESG Dashboard</h2>
              <p className="text-sm text-gray-500">Real-time sustainability metrics</p>
            </div>
            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">On Track</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Carbon Emissions */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Carbon</span>
                <TrendingDown className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">245.3</div>
              <div className="text-xs text-gray-500">tonnes CO₂e</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                <span>↓ 12.5%</span>
                <span className="text-gray-400">vs last month</span>
              </div>
            </motion.div>

            {/* E-Waste */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">E-Waste</span>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">89</div>
              <div className="text-xs text-gray-500">items tracked</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                <span>↑ 5 items</span>
                <span className="text-gray-400">this week</span>
              </div>
            </motion.div>

            {/* CSRD Compliance */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">CSRD</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">87%</div>
              <div className="text-xs text-gray-500">compliance</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <span>↑ 8%</span>
                <span className="text-gray-400">this quarter</span>
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Insights</span>
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-xs text-gray-500">recommendations</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                <span>3 high priority</span>
              </div>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Carbon Emissions Chart */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Carbon Emissions Trend</h3>
                <span className="text-xs text-green-600 font-medium">↓ Reducing</span>
              </div>
              
              {/* Simple Bar Chart SVG */}
              <div className="h-40 flex items-end gap-2">
                {[65, 58, 72, 55, 48, 52, 45, 42, 38, 35, 32, 28].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 1.5 + index * 0.05, duration: 0.4 }}
                    className="flex-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    title={`Month ${index + 1}`}
                  />
                ))}
              </div>
              
              <div className="flex justify-between mt-3 text-xs text-gray-400">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
              </div>
            </motion.div>

            {/* CSRD Compliance Progress */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">CSRD Datapoints</h3>
                <span className="text-xs text-emerald-600 font-medium">87% Complete</span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                {[
                  { label: 'Environmental', progress: 92, color: 'bg-green-500' },
                  { label: 'Social', progress: 85, color: 'bg-blue-500' },
                  { label: 'Governance', progress: 88, color: 'bg-purple-500' },
                  { label: 'Strategy', progress: 84, color: 'bg-amber-500' },
                ].map((item, index) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ delay: 1.6 + index * 0.1, duration: 0.8 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Alert Banner */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm mb-1">AI Insight Available</h4>
              <p className="text-xs text-blue-700">
                Your Scope 3 emissions show optimization potential. Click to view 3 AI-recommended actions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements for Depth */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-20 bg-green-100 rounded-lg p-3 shadow-lg border border-green-200"
      >
        <Leaf className="w-6 h-6 text-green-600" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -left-4 bottom-20 bg-blue-100 rounded-lg p-3 shadow-lg border border-blue-200"
      >
        <BarChart3 className="w-6 h-6 text-blue-600" />
      </motion.div>
    </motion.div>
  );
}
