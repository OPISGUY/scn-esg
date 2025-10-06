import PageLayout from '../components/layout/PageLayout';
import { CheckCircle, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Integration {
  id: number;
  name: string;
  category: string;
  description: string;
  logo: string;
  color: string;
}

export default function IntegrationsPage() {
  const integrations: Integration[] = [
    // Accounting
    { id: 1, name: 'Xero', category: 'Accounting', description: 'Sync financial data and emissions automatically', logo: '�', color: 'from-gray-400 to-gray-500' },
    { id: 2, name: 'QuickBooks', category: 'Accounting', description: 'Import transactions and calculate carbon footprint', logo: '💰', color: 'from-gray-400 to-gray-500' },
    { id: 3, name: 'Sage', category: 'Accounting', description: 'Connect accounting data for ESG reporting', logo: '�', color: 'from-gray-400 to-gray-500' },
    
    // Cloud Providers
    { id: 4, name: 'AWS', category: 'Cloud', description: 'Track cloud infrastructure emissions', logo: '☁️', color: 'from-gray-400 to-gray-500' },
    { id: 5, name: 'Azure', category: 'Cloud', description: 'Monitor Microsoft cloud carbon footprint', logo: '🌐', color: 'from-gray-400 to-gray-500' },
    { id: 6, name: 'Google Cloud', category: 'Cloud', description: 'Calculate GCP service emissions', logo: '🔵', color: 'from-gray-400 to-gray-500' },
    
    // CRM & Data
    { id: 7, name: 'Salesforce', category: 'CRM', description: 'Integrate customer and sustainability data', logo: '⚡', color: 'from-gray-400 to-gray-500' },
    { id: 8, name: 'HubSpot', category: 'CRM', description: 'Connect marketing and ESG metrics', logo: '🎯', color: 'from-gray-400 to-gray-500' },
    { id: 9, name: 'Airtable', category: 'Data', description: 'Import custom data sources', logo: '🗄️', color: 'from-gray-400 to-gray-500' },
    
    // Communication
    { id: 10, name: 'Slack', category: 'Communication', description: 'Get ESG alerts and updates', logo: '💬', color: 'from-gray-400 to-gray-500' },
    { id: 11, name: 'Microsoft Teams', category: 'Communication', description: 'Collaborate on sustainability goals', logo: '👥', color: 'from-gray-400 to-gray-500' },
    { id: 12, name: 'Email', category: 'Communication', description: 'Automated report delivery', logo: '✉️', color: 'from-gray-400 to-gray-500' },
  ];

  const categories = ['All', 'Accounting', 'Cloud', 'CRM', 'Data', 'Communication'];



  return (
    <PageLayout
      title="Integrations"
      subtitle="Connect Verdant By SCN with your favorite tools"
    >
      <div className="py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  index === 0
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${integration.color} text-white p-6 text-center relative overflow-hidden`}>
                <div className="relative z-10">
                  <div className="text-5xl mb-3">{integration.logo}</div>
                  <h3 className="text-2xl font-bold">{integration.name}</h3>
                  <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm mt-2">
                    {integration.category}
                  </span>
                  <span className="ml-2 inline-block bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                    COMING SOON
                  </span>
                </div>
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-6 min-h-[48px]">
                  {integration.description}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span>Two-way sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span>Real-time updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span>Secure connection</span>
                  </div>
                </div>

                <button 
                  disabled
                  className="w-full bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Coming Soon
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Integration CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-12 border border-gray-200 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Don't See Your Tool?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              We're constantly adding new integrations. Request a custom integration or build your own using our API.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-shadow inline-flex items-center justify-center gap-2"
              >
                Request Integration
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition inline-flex items-center justify-center gap-2"
              >
                View API Docs
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 grid md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Setup</h3>
            <p className="text-gray-600">
              Connect your tools in minutes with our guided setup wizard
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Automatic Sync</h3>
            <p className="text-gray-600">
              Data syncs automatically so your ESG metrics are always up to date
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Bank-level encryption keeps your data safe and secure
            </p>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
