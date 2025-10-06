import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CurrencySelector, convertPrice, getCurrencySymbol } from './CurrencySelector';
import { OnboardingFlow, UserData } from '../onboarding/OnboardingFlow';
import { getStripe } from '../../services/stripe';
import { buildApiUrl } from '../../utils/api';

const PricingSection: React.FC = () => {
  const [currency, setCurrency] = useState('GBP');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'free' | 'starter' | 'professional' | 'enterprise'>('free');
  const [, setIsProcessing] = useState(false);

  const basePrices = {
    free: 0,
    starter: 9.99,
    professional: 19.99,
    enterprise: 30,
  };

  const formatPrice = (basePrice: number) => {
    const convertedPrice = convertPrice(basePrice, currency);
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

  const handleTierSelection = (tier: 'free' | 'starter' | 'professional' | 'enterprise') => {
    if (tier === 'enterprise') {
      // Enterprise: open email directly
      window.location.href = 'mailto:hello@donatecomputers.uk?subject=Enterprise Plan Inquiry';
      return;
    }
    
    setSelectedTier(tier);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = async (userData: UserData) => {
    setIsProcessing(true);
    
    try {
      if (selectedTier === 'free') {
        // FREE tier: Create account directly without payment
        const response = await fetch(buildApiUrl('/api/v1/users/auth/register/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            company_name: userData.companyName,
            company_size: userData.companySize,
            industry: userData.industry,
            phone: userData.phone,
            tier: 'free',
          }),
        });

        if (!response.ok) throw new Error('Registration failed');
        
        // Redirect to login with success message
        window.location.href = '/login?registered=true';
        return;
      }

      // Paid tiers: Create Stripe checkout session
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe failed to initialize');

      // First, fetch available tiers to get the database ID
      const tiersResponse = await fetch(buildApiUrl('/api/v1/subscriptions/tiers/'));
      if (!tiersResponse.ok) throw new Error('Failed to fetch subscription tiers');
      const tiers = await tiersResponse.json();
      
      // Find the tier ID that matches our selected tier name
      const tier = tiers.find((t: any) => t.tier.toLowerCase() === selectedTier.toLowerCase());
      if (!tier) throw new Error(`Tier '${selectedTier}' not found`);

      const response = await fetch(buildApiUrl('/api/v1/subscriptions/create_checkout_session/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier_id: tier.id,  // Use the database ID, not the string name
          currency: currency.toLowerCase(),
          billing_cycle: 'monthly',
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancelled`,
          // Include user data for account creation
          customer_email: userData.email,
          metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            company_name: userData.companyName,
            company_size: userData.companySize,
            industry: userData.industry,
            phone: userData.phone,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleOnboardingCancel = () => {
    setShowOnboarding(false);
    setIsProcessing(false);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingFlow
          selectedTier={selectedTier}
          tierPrice={basePrices[selectedTier]}
          currency={currency}
          onComplete={handleOnboardingComplete}
          onCancel={handleOnboardingCancel}
        />
      )}
      
      <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Start with a 14-day free trial. No credit card required.
          </p>
          
          {/* Currency Selector */}
          <CurrencySelector 
            selectedCurrency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>
        
        {/* Pricing Grid - 4 tiers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* FREE Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <div className="text-4xl font-bold text-gray-900 mb-4">
              {formatPrice(basePrices.free)}<span className="text-lg text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Basic tracking
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                20 data points/month
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                50 e-waste items
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                No AI insights
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                No CSRD compliance
              </li>
            </ul>
            <button 
              onClick={() => handleTierSelection('free')}
              className="block w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition text-center"
            >
              Get Started Free
            </button>
          </motion.div>
          
          {/* Starter Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
            <div className="text-4xl font-bold text-gray-900 mb-4">
              {formatPrice(basePrices.starter)}<span className="text-lg text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Carbon tracking (50 points/month)
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                CSRD gap analysis (10 datapoints)
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Monthly ESG reports
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                AI insights (10 queries/month)
              </li>
            </ul>
            <button 
              onClick={() => handleTierSelection('starter')}
              className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center"
            >
              Start Free Trial
            </button>
          </motion.div>
          
          {/* Professional Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -8, boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 12px 12px -5px rgba(0, 0, 0, 0.06)" }}
            className="bg-white rounded-lg shadow-xl p-8 border-2 border-green-600 relative"
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
            <div className="text-4xl font-bold text-gray-900 mb-4">
              {formatPrice(basePrices.professional)}<span className="text-lg text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Unlimited carbon data
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Full CSRD compliance
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Advanced AI (100 queries)
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Carbon credit marketplace
              </li>
            </ul>
            <button 
              onClick={() => handleTierSelection('professional')}
              className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center"
            >
              Start Free Trial
            </button>
          </motion.div>
          
          {/* Enterprise Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <div className="text-4xl font-bold text-gray-900 mb-4">
              {formatPrice(basePrices.enterprise)}<span className="text-lg text-gray-600">/user/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Unlimited users
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Full API access
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                White-label reports
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Dedicated manager
              </li>
            </ul>
            <button 
              onClick={() => handleTierSelection('enterprise')}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Contact Sales
            </button>
          </motion.div>
        </div>
        
        {/* Trust Badges */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-4">Join the future of ESG compliance</p>
          <div className="flex flex-wrap justify-center gap-8">
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Secure payments</span>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default PricingSection;
