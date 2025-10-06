import React from 'react';
import { motion } from 'framer-motion';

const FinalCTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-600 to-blue-600 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Transform Your ESG Journey?
        </h2>
        <p className="text-xl text-green-50 mb-8">
          Join forward-thinking companies reducing emissions and achieving compliance.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.a 
            href="/free-trial"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition shadow-lg"
          >
            Start Free Trial
          </motion.a>
          <motion.a 
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition"
          >
            Schedule Demo
          </motion.a>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-green-50 text-sm">
          <span>✓ 14-day trial</span>
          <span>✓ No credit card</span>
          <span>✓ Cancel anytime</span>
        </div>
      </motion.div>
    </section>
  );
};

export default FinalCTASection;
