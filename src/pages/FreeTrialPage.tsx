import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Leaf, Recycle, Zap, Shield, TrendingUp, FileText, BarChart3, Sparkles } from 'lucide-react';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';

/**
 * FreeTrialPage - Dedicated marketing landing page for the Free tier
 * SEO-optimized to drive organic traffic and conversions
 */
export default function FreeTrialPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleGetStarted = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = async (userData: any) => {
    try {
      const response = await fetch('/api/v1/auth/register/', {
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
      
      window.location.href = '/login?registered=true';
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {/* SEO Meta Tags - Add react-helmet-async to handle these properly */}
      {/* For now, these should be added to index.html or via a meta management library */}

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-5xl mx-auto text-center"
          >
            {/* Green Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
              <Recycle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                World's First Green-Powered ESG Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Start Your <span className="text-green-600">Free ESG Journey</span> Today
            </h1>
            
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Track your carbon footprint, manage e-waste, and begin your CSRD compliance journey—all powered by 100% recycled hardware and renewable energy.
            </p>
            
            <p className="text-lg text-green-600 font-semibold mb-8">
              ✨ No credit card required · Forever free · Get started in 60 seconds
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="w-5 h-5" />
              Get Started Free
            </motion.button>

            <p className="mt-4 text-sm text-gray-500">
              Join 1,000+ organizations already tracking their impact
            </p>
          </motion.div>
        </section>

        {/* What's Included Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What's Included in Your <span className="text-green-600">Free Account</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <TrendingUp className="w-8 h-8 text-green-600" />,
                  title: 'Carbon Tracking',
                  description: 'Track up to 20 carbon data points per month across Scope 1, 2, and 3 emissions'
                },
                {
                  icon: <Recycle className="w-8 h-8 text-green-600" />,
                  title: 'E-Waste Management',
                  description: 'Monitor and manage up to 50 e-waste items with disposal tracking'
                },
                {
                  icon: <FileText className="w-8 h-8 text-green-600" />,
                  title: 'CSRD Introduction',
                  description: 'Get familiar with CSRD compliance requirements and datapoints'
                },
                {
                  icon: <BarChart3 className="w-8 h-8 text-green-600" />,
                  title: 'Monthly Reports',
                  description: 'Generate 1 comprehensive sustainability report per month'
                },
                {
                  icon: <Shield className="w-8 h-8 text-green-600" />,
                  title: 'Data Security',
                  description: 'Enterprise-grade security with 6 months of data retention'
                },
                {
                  icon: <Leaf className="w-8 h-8 text-green-600" />,
                  title: 'Green Infrastructure',
                  description: 'Your data runs on 100% recycled hardware powered by renewable energy'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Compare Plans & <span className="text-green-600">Upgrade Anytime</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="p-4 text-left">Feature</th>
                    <th className="p-4 text-center">Free</th>
                    <th className="p-4 text-center">Starter (£9.99/mo)</th>
                    <th className="p-4 text-center">Pro (£19.99/mo)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Carbon Data Points', free: '20/month', starter: '50/month', pro: 'Unlimited' },
                    { feature: 'E-Waste Items', free: '50', starter: '100', pro: 'Unlimited' },
                    { feature: 'CSRD Compliance', free: 'Basic', starter: '10 datapoints', pro: 'All datapoints' },
                    { feature: 'AI Insights', free: '—', starter: '10 queries/mo', pro: '100 queries/mo' },
                    { feature: 'Reports', free: '1/month', starter: 'Unlimited', pro: 'Unlimited' },
                    { feature: 'Users', free: '1', starter: '1', pro: '5' },
                    { feature: 'Data Retention', free: '6 months', starter: '12 months', pro: '36 months' },
                  ].map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-4 font-semibold text-gray-900">{row.feature}</td>
                      <td className="p-4 text-center text-gray-700">{row.free}</td>
                      <td className="p-4 text-center text-gray-700">{row.starter}</td>
                      <td className="p-4 text-center text-gray-700">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center mt-6 text-gray-600">
              All plans include our green-powered infrastructure running on recycled hardware 🌱
            </p>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-gray-600">Renewable Energy</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">1,000+</div>
                <div className="text-gray-600">Organizations Trust Us</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">50 Tonnes</div>
                <div className="text-gray-600">CO₂ Saved Annually</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">1st</div>
                <div className="text-gray-600">Green ESG Platform</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 bg-gradient-to-br from-green-50 to-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked <span className="text-green-600">Questions</span>
            </h2>

            <div className="space-y-6">
              {[
                {
                  question: 'Is the free plan really free forever?',
                  answer: 'Yes! Our Free plan is 100% free forever with no hidden charges. No credit card required to sign up. You can upgrade to paid plans anytime as your needs grow.'
                },
                {
                  question: 'What does "green-powered platform" mean?',
                  answer: 'We practice what we preach. Our entire platform runs on servers built from 100% recycled hardware, powered by renewable energy sources. This makes us the first ESG platform with a net-zero infrastructure.'
                },
                {
                  question: 'How quickly can I get started?',
                  answer: 'You can create your account and start tracking your carbon footprint in under 60 seconds. Simply enter your details, and you\'ll have immediate access to your dashboard.'
                },
                {
                  question: 'Can I upgrade or downgrade later?',
                  answer: 'Absolutely! You can upgrade to Starter (£9.99/mo) or Professional (£19.99/mo) plans at any time. Downgrades are also seamless with no penalties.'
                },
                {
                  question: 'What kind of support do I get on the free plan?',
                  answer: 'Free plan users have access to our comprehensive knowledge base, community forums, and email support. Paid plans include faster response times and priority support.'
                },
                {
                  question: 'Is my data secure?',
                  answer: 'Yes. We use enterprise-grade encryption, secure data centers, and comply with GDPR. Your sustainability data is as secure as your financial information.'
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 ml-7">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 text-green-50">
              Join the movement toward sustainable business practices. Start tracking your carbon footprint today—on the world's greenest ESG platform.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-green-600 rounded-lg text-lg font-bold shadow-2xl hover:shadow-3xl transition-all"
            >
              <Zap className="w-6 h-6" />
              Get Started Free - No Credit Card Required
            </motion.button>

            <p className="mt-6 text-green-100 text-sm">
              🌍 Powered by 100% recycled hardware · 🔒 Enterprise-grade security · ⚡ Setup in 60 seconds
            </p>
          </motion.div>
        </section>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingFlow
          selectedTier="free"
          tierPrice={0}
          currency="GBP"
          onComplete={handleOnboardingComplete}
          onCancel={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}
