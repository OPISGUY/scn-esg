import React from 'react';
import { motion } from 'framer-motion';

const ProblemSolutionSection: React.FC = () => {
  const problems = [
    {
      emoji: '😓',
      problem: 'Manual data entry',
      detail: 'Hours spent collecting and consolidating ESG data',
      solution: 'AI-powered data imports',
      result: '⚡ 10x faster',
    },
    {
      emoji: '📊',
      problem: 'Complex CSRD compliance',
      detail: 'Navigating 1,000+ ESRS requirements',
      solution: 'Auto-mapped datapoints',
      result: '🎯 100% audit-ready',
    },
    {
      emoji: '💸',
      problem: 'Opaque carbon markets',
      detail: 'Difficulty finding verified carbon credits',
      solution: 'Transparent marketplace',
      result: '💰 15% cost savings',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simplify Your ESG Journey
          </h2>
          <p className="text-xl text-gray-600">
            From challenges to solutions, we've got you covered
          </p>
        </div>
        
        {/* Problem/Solution Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, index) => (
            <motion.div
              key={item.problem}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="text-center p-6"
            >
              <div className="text-4xl mb-4">{item.emoji}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.problem}</h3>
              <div className="text-gray-600 mb-4">{item.detail}</div>
              <div className="text-green-600 font-semibold">→ {item.solution}</div>
              <div className="text-2xl font-bold text-green-600 mt-2">{item.result}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ProblemSolutionSection;
