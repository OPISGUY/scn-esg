import PageLayout from '../components/layout/PageLayout';
import { Code, Key, Zap, BookOpen, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Endpoint {
  method: string;
  path: string;
  description: string;
}

export default function APIPage() {
  const endpoints: Endpoint[] = [
    { method: 'GET', path: '/api/v1/emissions', description: 'Retrieve emissions data' },
    { method: 'POST', path: '/api/v1/emissions', description: 'Submit new emissions data' },
    { method: 'GET', path: '/api/v1/reports', description: 'List available reports' },
    { method: 'POST', path: '/api/v1/reports/generate', description: 'Generate a new report' },
    { method: 'GET', path: '/api/v1/csrd/datapoints', description: 'Fetch CSRD datapoints' },
    { method: 'PUT', path: '/api/v1/csrd/datapoints/{id}', description: 'Update datapoint compliance' },
    { method: 'GET', path: '/api/v1/marketplace/projects', description: 'Browse carbon credit projects' },
    { method: 'POST', path: '/api/v1/marketplace/purchase', description: 'Purchase carbon credits' },
  ];

  const features = [
    {
      icon: Key,
      title: 'API Key Authentication',
      description: 'Secure your API requests with API keys. Generate and manage keys in your dashboard.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Zap,
      title: 'Real-time Data',
      description: 'Access your emissions data, compliance status, and insights in real-time.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Shield,
      title: 'Rate Limiting',
      description: 'Pro: 1,000 requests/hour | Enterprise: Unlimited requests',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const getMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      'GET': 'bg-blue-100 text-blue-800',
      'POST': 'bg-green-100 text-green-800',
      'PUT': 'bg-amber-100 text-amber-800',
      'DELETE': 'bg-red-100 text-red-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PageLayout
      title="API Documentation"
      subtitle="Integrate Verdant By SCN into your applications"
    >
      <div className="py-12">
        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 mb-16 shadow-xl"
        >
          <div className="max-w-3xl mx-auto">
            <Code className="w-12 h-12 mb-4" />
            <h2 className="text-3xl font-bold mb-4">RESTful API</h2>
            <p className="text-xl text-green-100 mb-6">
              Build custom integrations and automate your ESG workflows with our comprehensive REST API.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-lg font-mono">Base URL: https://api.verdant.scn.com/v1</span>
              <span className="bg-white/20 px-4 py-2 rounded-lg">JSON Format</span>
              <span className="bg-white/20 px-4 py-2 rounded-lg">HTTPS Only</span>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
              >
                <div className={`bg-gradient-to-r ${feature.color} text-white p-6`}>
                  <Icon className="w-10 h-10 mb-3" />
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">API Endpoints</h2>
          
          <div className="space-y-3">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={`${endpoint.method}-${endpoint.path}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded font-bold text-sm ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="font-mono text-gray-700 flex-1">{endpoint.path}</code>
                  <span className="text-gray-600">{endpoint.description}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Example Request</h2>
          
          <div className="bg-gray-900 text-green-400 rounded-xl p-6 font-mono text-sm overflow-x-auto shadow-xl">
            <div className="mb-4">
              <span className="text-gray-500"># Retrieve emissions data</span>
            </div>
            <div className="mb-2">
              <span className="text-blue-400">curl</span> -X <span className="text-yellow-400">GET</span> \
            </div>
            <div className="mb-2 pl-4">
              https://api.verdant.scn.com/v1/emissions \
            </div>
            <div className="mb-2 pl-4">
              -H <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span> \
            </div>
            <div className="pl-4">
              -H <span className="text-green-400">"Content-Type: application/json"</span>
            </div>
            
            <div className="mt-6 mb-2">
              <span className="text-gray-500"># Response</span>
            </div>
            <div className="text-gray-300">
              {`{
  "status": "success",
  "data": {
    "total_emissions": 245.3,
    "unit": "tonnes_co2e",
    "period": "2025-03",
    "breakdown": {
      "scope_1": 45.2,
      "scope_2": 123.8,
      "scope_3": 76.3
    }
  }
}`}
            </div>
          </div>
        </motion.div>

        {/* Authentication Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mb-16 bg-blue-50 rounded-2xl p-8 border border-blue-200"
        >
          <div className="flex items-start gap-4">
            <Key className="w-10 h-10 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Authentication</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                All API requests require authentication using an API key. Include your API key in the 
                Authorization header as a Bearer token. You can generate API keys from your dashboard 
                under Settings → API Keys.
              </p>
              <code className="block bg-white p-4 rounded-lg text-sm font-mono border border-blue-300">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </div>
        </motion.div>

        {/* Rate Limits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Pro Plan</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">1,000</div>
            <p className="text-gray-600 mb-4">requests per hour</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Standard endpoints
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Webhook support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Email support
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-8 border border-purple-200">
            <Zap className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Enterprise Plan</h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">Unlimited</div>
            <p className="text-gray-600 mb-4">requests</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-purple-600">✓</span>
                All endpoints
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600">✓</span>
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600">✓</span>
                Custom integrations
              </li>
            </ul>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-12 border border-gray-200"
        >
          <BookOpen className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            View our complete API documentation with detailed examples, error codes, and best practices.
          </p>
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-shadow inline-flex items-center gap-2">
            <Code className="w-5 h-5" />
            View Full API Docs
          </button>
        </motion.div>
      </div>
    </PageLayout>
  );
}
