import React from 'react';
import { motion } from 'framer-motion';

const SocialProofSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 bg-gray-50">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built for ESG Excellence
          </h2>
        </motion.div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <motion.div variants={itemVariants}>
            <div className="text-4xl font-bold text-green-600 mb-2">1,144+</div>
            <div className="text-gray-600">ESRS Datapoints</div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="text-4xl font-bold text-green-600 mb-2">CSRD</div>
            <div className="text-gray-600">Compliant</div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="text-4xl font-bold text-green-600 mb-2">AI</div>
            <div className="text-gray-600">Powered Insights</div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="text-4xl font-bold text-green-600 mb-2">ISO 27001</div>
            <div className="text-gray-600">Ready</div>
          </motion.div>
        </div>
        
        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500">
          <div className="flex items-center">
            <span className="text-sm font-medium">🔒 GDPR Compliant</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium">✓ SOC 2 Ready</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium">🤖 Powered by Google Gemini AI</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default SocialProofSection;
