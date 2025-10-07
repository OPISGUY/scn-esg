import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MobileMenu from './MobileMenu';
import { GreenBadgeFloating } from '../branding/GreenBadges';
import { BRAND_IDENTITY } from '../../constants/branding';
import DashboardPreview from '../visualizations/DashboardPreview';

const HeroSection: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-blue-600 overflow-hidden pb-20">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/verdant-logo-horizontal.svg" 
                alt="Verdant By SCN" 
                className="h-10"
              />
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#features" 
                onClick={(e) => handleSmoothScroll(e, '#features')}
                className="text-white hover:text-green-100 transition"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => handleSmoothScroll(e, '#pricing')}
                className="text-white hover:text-green-100 transition"
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                onClick={(e) => handleSmoothScroll(e, '#faq')}
                className="text-white hover:text-green-100 transition"
              >
                FAQ
              </a>
              <a 
                href="/login" 
                className="text-white hover:text-green-100 transition"
              >
                Login
              </a>
              <a 
                href="/free-trial" 
                className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Start Free Trial
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Green Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center"
          >
            <GreenBadgeFloating type="greenPowered" />
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            {BRAND_IDENTITY.messaging.hero.primary}
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto"
          >
            {BRAND_IDENTITY.messaging.hero.secondary}
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.a 
              href="/free-trial"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition shadow-lg"
            >
              Start 14-Day Free Trial
            </motion.a>
            <motion.a 
              href="/demo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition"
            >
              Try Demo
            </motion.a>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center text-green-50 text-sm"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Setup in 5 minutes
            </span>
          </motion.div>
        </motion.div>
        
        {/* Dashboard Preview - Interactive Demo */}
        <div className="mt-20">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
