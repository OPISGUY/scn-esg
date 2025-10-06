import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AIInsightsPreview, CSRDCompliancePreview, CarbonTrendPreview } from '../visualizations/FeaturePreviews';
import CarbonMarketplacePreview from '../visualizations/CarbonMarketplacePreview';

type Tab = 'carbon' | 'csrd' | 'ai' | 'credits';

const FeaturesShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('carbon');
  
  const tabs = [
    { id: 'carbon' as Tab, label: 'Carbon Management', icon: '🌱' },
    { id: 'csrd' as Tab, label: 'CSRD Compliance', icon: '📋' },
    { id: 'ai' as Tab, label: 'AI Insights', icon: '🤖' },
    { id: 'credits' as Tab, label: 'Carbon Credits', icon: '💚' },
  ];
  
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive ESG management from carbon tracking to compliance reporting
          </p>
        </motion.div>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {activeTab === 'carbon' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Real-time Carbon Tracking</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Track Scope 1, 2, and 3 emissions
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Automated data collection from multiple sources
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Scenario modeling and reduction forecasting
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Visual dashboards and custom reports
                  </li>
                </ul>
              </div>
              <CarbonTrendPreview />
            </div>
          )}
          
          {activeTab === 'csrd' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">CSRD Compliance Made Easy</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Complete ESRS datapoint catalog (1,144+)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Double materiality assessment tools
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Gap analysis and readiness scoring
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Automated sustainability statement generation
                  </li>
                </ul>
              </div>
              <CSRDCompliancePreview />
            </div>
          )}
          
          {activeTab === 'ai' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Intelligence</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Natural language queries about your data
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Predictive analytics and trend forecasting
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Automated recommendations for improvement
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Smart data validation and quality checks
                  </li>
                </ul>
              </div>
              <AIInsightsPreview />
            </div>
          )}
          
          {activeTab === 'credits' && (
            <div>
              <CarbonMarketplacePreview />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;
