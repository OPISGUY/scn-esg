import React from 'react';
import { motion } from 'framer-motion';

const IntegrationsSection: React.FC = () => {
  const integrations = [
    { name: 'Xero', category: 'Accounting', icon: '📊' },
    { name: 'QuickBooks', category: 'Accounting', icon: '💼' },
    { name: 'SAP', category: 'ERP', icon: '🏢' },
    { name: 'Slack', category: 'Communication', icon: '💬' },
    { name: 'Microsoft Teams', category: 'Communication', icon: '👥' },
    { name: 'AWS', category: 'Cloud', icon: '☁️' },
    { name: 'Azure', category: 'Cloud', icon: '🌐' },
    { name: 'Google Cloud', category: 'Cloud', icon: '🔷' },
  ];

  const standards = [
    { name: 'GRI', description: 'Global Reporting Initiative' },
    { name: 'CDP', description: 'Carbon Disclosure Project' },
    { name: 'TCFD', description: 'Task Force on Climate' },
    { name: 'CSRD', description: 'EU Sustainability Reporting' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Integrates with Your Existing Tools
          </h2>
          <p className="text-xl text-gray-600">
            Seamless connectivity with the platforms you already use
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              className="bg-gray-100 p-6 rounded-lg shadow-md text-center border-2 border-gray-200 relative"
            >
              <span className="absolute top-2 right-2 text-xs bg-yellow-400 text-gray-900 px-2 py-1 rounded font-semibold">
                COMING SOON
              </span>
              <div className="text-4xl mb-3 opacity-60">{integration.icon}</div>
              <h3 className="font-semibold text-gray-700 mb-1">{integration.name}</h3>
              <p className="text-sm text-gray-500">{integration.category}</p>
            </motion.div>
          ))}
        </div>

        {/* Standards */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Compliant with Leading Frameworks
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {standards.map((standard, index) => (
              <motion.div
                key={standard.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white px-4 py-3 rounded-lg border-2 border-gray-200"
              >
                <div className="font-bold text-green-600 mb-1">{standard.name}</div>
                <div className="text-xs text-gray-600">{standard.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default IntegrationsSection;
