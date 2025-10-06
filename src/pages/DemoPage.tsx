import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Leaf, Award, FileText, Download, ArrowLeft } from 'lucide-react';

const DemoPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'emissions' | 'compliance' | 'reports'>('dashboard');

  const demoStats = {
    totalEmissions: 1247.5,
    emissionsChange: -12.3,
    offsetsPurchased: 850,
    complianceScore: 87,
    reportsGenerated: 24
  };

  const emissionsData = [
    { month: 'Jan', scope1: 120, scope2: 180, scope3: 340 },
    { month: 'Feb', scope1: 115, scope2: 175, scope3: 330 },
    { month: 'Mar', scope1: 110, scope2: 170, scope3: 320 },
    { month: 'Apr', scope1: 105, scope2: 165, scope3: 310 },
    { month: 'May', scope1: 100, scope2: 160, scope3: 300 },
    { month: 'Jun', scope1: 95, scope2: 155, scope3: 290 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href="/"
                className="flex items-center gap-2 text-white hover:text-green-100 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </a>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xl font-bold">Verdant By SCN</span>
                <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                  DEMO MODE
                </span>
              </div>
            </div>
            <a
              href="/free-trial"
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition shadow-lg"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </div>

      {/* Main Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Notice */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              ℹ️
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Interactive Demo</h3>
              <p className="text-sm text-blue-800">
                This is a preview of the Verdant platform with sample data. Start your free trial to unlock full functionality with your real data.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setSelectedTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                selectedTab === 'dashboard'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setSelectedTab('emissions')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                selectedTab === 'emissions'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Leaf className="w-5 h-5" />
              Carbon Tracking
            </button>
            <button
              onClick={() => setSelectedTab('compliance')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                selectedTab === 'compliance'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Award className="w-5 h-5" />
              Compliance
            </button>
            <button
              onClick={() => setSelectedTab('reports')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                selectedTab === 'reports'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              Reports
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {selectedTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Total Emissions</span>
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{demoStats.totalEmissions}</div>
                <div className="text-sm text-green-600 mt-1">
                  {demoStats.emissionsChange}% vs last month
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Offsets Purchased</span>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{demoStats.offsetsPurchased}</div>
                <div className="text-sm text-gray-600 mt-1">tCO2e offset</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Compliance Score</span>
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{demoStats.complianceScore}%</div>
                <div className="text-sm text-green-600 mt-1">+5% this quarter</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Reports Generated</span>
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{demoStats.reportsGenerated}</div>
                <div className="text-sm text-gray-600 mt-1">This year</div>
              </div>
            </div>

            {/* Emissions Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Emissions Trend</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {emissionsData.map((data, index) => {
                  const total = data.scope1 + data.scope2 + data.scope3;
                  const maxTotal = Math.max(...emissionsData.map(d => d.scope1 + d.scope2 + d.scope3));
                  const height = (total / maxTotal) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="w-full bg-gradient-to-t from-green-600 via-blue-500 to-purple-500 rounded-t"
                        />
                      </div>
                      <span className="text-xs text-gray-600">{data.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded" />
                  <span>Scope 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Scope 2</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded" />
                  <span>Scope 3</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Emissions Tracking View */}
        {selectedTab === 'emissions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-xl font-bold mb-4">Carbon Emissions Tracking</h3>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-2">Scope 1 - Direct Emissions</h4>
                <p className="text-gray-600 mb-2">Company vehicles, on-site fuel combustion</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div className="bg-green-600 h-3 rounded-full" style={{ width: '65%' }} />
                  </div>
                  <span className="font-semibold">650 tCO2e</span>
                </div>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-2">Scope 2 - Indirect Emissions</h4>
                <p className="text-gray-600 mb-2">Purchased electricity, heating, cooling</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <span className="font-semibold">450 tCO2e</span>
                </div>
              </div>
              <div className="pb-4">
                <h4 className="font-semibold mb-2">Scope 3 - Value Chain Emissions</h4>
                <p className="text-gray-600 mb-2">Supply chain, business travel, waste</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-600 h-3 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="font-semibold">1,700 tCO2e</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Compliance View */}
        {selectedTab === 'compliance' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-xl font-bold mb-4">CSRD Compliance Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Environmental Datapoints</h4>
                  <p className="text-sm text-gray-600">ESRS E1 Climate Change</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">92%</div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Social Datapoints</h4>
                  <p className="text-sm text-gray-600">ESRS S1-S4</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">67%</div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Governance Datapoints</h4>
                  <p className="text-sm text-gray-600">ESRS G1</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">88%</div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reports View */}
        {selectedTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Generated Reports</h3>
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                <Download className="w-4 h-4" />
                Generate Report
              </button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Annual Sustainability Report 2024', date: '2025-01-15', format: 'PDF' },
                { name: 'Q4 Carbon Footprint Report', date: '2024-12-31', format: 'PDF' },
                { name: 'CSRD Compliance Report', date: '2024-11-20', format: 'PDF' },
                { name: 'Scope 3 Analysis Report', date: '2024-10-05', format: 'Excel' },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-gray-600">{report.date}</div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                    <Download className="w-4 h-4" />
                    {report.format}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-2">Ready to track your sustainability journey?</h3>
          <p className="text-green-50 mb-6">Start your 14-day free trial with full access to all features</p>
          <a
            href="/free-trial"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition shadow-lg"
          >
            Start Free Trial - No Credit Card Required
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoPage;
