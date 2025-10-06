import { motion } from 'framer-motion';
import { Leaf, Recycle, Zap, Globe, CheckCircle } from 'lucide-react';
import { BRAND_IDENTITY } from '../../constants/branding';
import { GreenStats, CertificationBadges } from '../branding/GreenBadges';

/**
 * GreenCommitmentSection - Highlights the platform's green infrastructure
 * This section communicates the USP: "World's First Green-Powered ESG Platform on Recycled Hardware"
 */
export default function GreenCommitmentSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-green-50 via-emerald-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <Leaf className="absolute top-10 left-10 w-32 h-32 text-green-600 rotate-12" />
        <Recycle className="absolute bottom-20 right-20 w-40 h-40 text-emerald-600 -rotate-12" />
        <Zap className="absolute top-40 right-40 w-24 h-24 text-green-600" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
            <Leaf className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {BRAND_IDENTITY.tagline}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {BRAND_IDENTITY.messaging.commitment.title}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            {BRAND_IDENTITY.messaging.commitment.subtitle}
          </p>

          <p className="text-lg text-green-600 max-w-2xl mx-auto">
            {BRAND_IDENTITY.messaging.commitment.description}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <GreenStats />
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {BRAND_IDENTITY.messaging.features.map((feature: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all group"
            >
              <CheckCircle className="w-8 h-8 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-gray-700 font-medium">{feature}</p>
            </motion.div>
          ))}
        </div>

        {/* Recycling Process Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-10 mb-16 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(20)].map((_, i) => (
                <Recycle
                  key={i}
                  className="absolute w-16 h-16"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 text-center">
            <h3 className="text-3xl font-bold mb-4">How We Extend Hardware Lifecycles</h3>
            <p className="text-green-50 text-lg mb-8 max-w-3xl mx-auto">
              Instead of buying new servers, we refurbish and repurpose decommissioned hardware from data centers. 
              This reduces e-waste, saves energy in manufacturing, and lowers carbon emissions by up to 80%.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Globe className="w-12 h-12 mx-auto mb-3" />
                <div className="text-2xl font-bold mb-2">80%</div>
                <div className="text-green-50">Less CO₂ vs New Hardware</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Recycle className="w-12 h-12 mx-auto mb-3" />
                <div className="text-2xl font-bold mb-2">5-7 Years</div>
                <div className="text-green-50">Extended Server Lifespan</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Zap className="w-12 h-12 mx-auto mb-3" />
                <div className="text-2xl font-bold mb-2">100%</div>
                <div className="text-green-50">Renewable Energy Powered</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Certified & <span className="text-green-600">Verified Green</span>
          </h3>
          <CertificationBadges />
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <blockquote className="text-2xl font-medium text-gray-700 italic max-w-3xl mx-auto">
            "{BRAND_IDENTITY.usp}"
          </blockquote>
          <p className="mt-4 text-green-600 font-semibold">
            — The Verdant By SCN Promise
          </p>
        </motion.div>
      </div>
    </section>
  );
}
