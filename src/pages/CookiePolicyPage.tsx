import PageLayout from '../components/layout/PageLayout';
import { Cookie, Shield, Settings, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface CookieCategory {
  name: string;
  status: 'required' | 'optional';
  description: string;
  examples: string[];
  duration: string;
}

export default function CookiePolicyPage() {
  const cookieCategories: CookieCategory[] = [
    {
      name: 'Essential Cookies',
      status: 'required',
      description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.',
      examples: ['Session ID', 'Authentication token', 'Security tokens', 'Load balancing'],
      duration: 'Session or up to 1 year'
    },
    {
      name: 'Analytics Cookies',
      status: 'optional',
      description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us understand which pages are most popular and see how visitors move around the site.',
      examples: ['Google Analytics', 'Page views', 'User behavior tracking'],
      duration: 'Up to 2 years'
    },
    {
      name: 'Marketing Cookies',
      status: 'optional',
      description: 'These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant adverts on other sites. They are disabled by default.',
      examples: ['Ad targeting', 'Conversion tracking', 'Remarketing'],
      duration: 'Up to 1 year'
    }
  ];

  return (
    <PageLayout
      title="Cookie Policy"
      subtitle="How we use cookies on our website"
    >
      <div className="py-12 max-w-4xl mx-auto">
        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-xl p-4 mb-8 flex items-center gap-3 border border-blue-200"
        >
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span className="text-gray-700">
            <strong>Last updated:</strong> March 2025
          </span>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-lg max-w-none mb-12"
        >
          <p className="text-gray-700 leading-relaxed">
            This Cookie Policy explains how Verdant By SCN ("we", "us", or "our") uses cookies and similar 
            tracking technologies when you visit our website. This policy provides you with information 
            about what cookies are, which cookies we use, and how you can manage your cookie preferences.
          </p>
        </motion.div>

        {/* What are Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900">What are Cookies?</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Cookies are small text files that are placed on your device when you visit a website. They are 
            widely used to make websites work more efficiently, as well as to provide information to the 
            site owners. Cookies can be "session cookies" (deleted when you close your browser) or "persistent 
            cookies" (remain on your device for a set period or until you delete them).
          </p>
        </motion.div>

        {/* Cookie Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Types of Cookies We Use</h2>
          
          <div className="space-y-6">
            {cookieCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    category.status === 'required' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {category.status === 'required' ? 'Always Active' : 'Optional'}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {category.description}
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                    <ul className="space-y-1">
                      {category.examples.map((example) => (
                        <li key={example} className="text-gray-600 flex items-center gap-2">
                          <span className="text-green-600">•</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Duration:</h4>
                    <p className="text-gray-600">{category.duration}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Managing Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900">How to Manage Cookies</h2>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <p className="text-gray-700 mb-4 leading-relaxed">
              You can control and manage cookies in various ways. Please note that removing or blocking 
              cookies may impact your user experience and some features may no longer be fully functional.
            </p>
            
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Browser Settings</h4>
                <p className="text-gray-600">
                  Most browsers allow you to refuse or accept cookies, delete existing cookies, and set 
                  preferences for certain websites. Check your browser's help section for instructions.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Our Cookie Preferences</h4>
                <p className="text-gray-600">
                  You can adjust your cookie preferences in your account settings or using our cookie 
                  consent banner when you first visit our site.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Third-Party Cookies</h4>
                <p className="text-gray-600">
                  To opt out of third-party advertising cookies, visit 
                  the Network Advertising Initiative opt-out page or use browser extensions designed 
                  to block tracking cookies.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Third-Party Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We may use third-party services such as Google Analytics to help us understand how visitors 
            use our website. These services may set their own cookies on your device. We do not control 
            these cookies and recommend you check the third-party websites for more information about 
            their cookies and how to manage them.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Third-party services we use include:
          </p>
          <ul className="mt-3 space-y-2">
            <li className="text-gray-600 flex items-center gap-2">
              <span className="text-green-600">•</span>
              Google Analytics (analytics and reporting)
            </li>
            <li className="text-gray-600 flex items-center gap-2">
              <span className="text-green-600">•</span>
              Stripe (payment processing)
            </li>
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-8 text-center"
        >
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Questions About Cookies?</h3>
          <p className="text-green-100 mb-6">
            If you have any questions about our use of cookies, please contact us.
          </p>
          <a
            href="mailto:hello@donatecomputers.uk"
            className="inline-block bg-white text-green-600 font-bold px-8 py-3 rounded-lg hover:bg-green-50 transition"
          >
            hello@donatecomputers.uk
          </a>
        </motion.div>
      </div>
    </PageLayout>
  );
}
