import PageLayout from '../components/layout/PageLayout';
import { Book, Play, Code, Zap, BookOpen, FileText, Video, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocSection {
  icon: typeof Book;
  title: string;
  description: string;
  links: { label: string; url: string }[];
  color: string;
}

export default function DocsPage() {
  const docSections: DocSection[] = [
    {
      icon: Zap,
      title: 'Getting Started',
      description: 'Quick start guides and setup tutorials to get you up and running fast',
      links: [
        { label: 'Quick Start Guide', url: '#' },
        { label: 'Account Setup', url: '#' },
        { label: 'First Data Import', url: '#' },
        { label: 'Dashboard Tour', url: '#' }
      ],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: BookOpen,
      title: 'Features & Guides',
      description: 'In-depth documentation for all platform features and capabilities',
      links: [
        { label: 'Carbon Tracking', url: '#' },
        { label: 'CSRD Compliance', url: '#' },
        { label: 'AI Insights', url: '#' },
        { label: 'Carbon Marketplace', url: '#' },
        { label: 'Report Generation', url: '#' },
        { label: 'Team Management', url: '#' }
      ],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Code,
      title: 'API & Integrations',
      description: 'Developer documentation for API, webhooks, and third-party integrations',
      links: [
        { label: 'API Reference', url: '#' },
        { label: 'Authentication', url: '#' },
        { label: 'Webhooks', url: '#' },
        { label: 'Data Import API', url: '#' },
        { label: 'Third-Party Integrations', url: '#' }
      ],
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: HelpCircle,
      title: 'Resources & Support',
      description: 'Additional resources, FAQs, and support information',
      links: [
        { label: 'Video Tutorials', url: '#' },
        { label: 'FAQ', url: '#' },
        { label: 'Troubleshooting', url: '#' },
        { label: 'Contact Support', url: '#' },
        { label: 'Community Forum', url: '#' }
      ],
      color: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <PageLayout
      title="Documentation"
      subtitle="Everything you need to master the Verdant By SCN platform"
    >
      <div className="py-12">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:outline-none text-lg"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
              Search
            </button>
          </div>
        </motion.div>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {docSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${section.color} text-white p-6`}>
                  <Icon className="w-12 h-12 mb-3" />
                  <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                  <p className="text-white/90">{section.description}</p>
                </div>

                {/* Links */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.url}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group"
                        >
                          <span className="text-gray-700 group-hover:text-green-600 font-medium">
                            {link.label}
                          </span>
                          <span className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {/* Video Tutorials */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
            <Video className="w-10 h-10 text-red-600 mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-gray-600 mb-4">
              Watch step-by-step video guides covering all platform features
            </p>
            <button className="text-red-600 font-semibold hover:text-red-700 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Now
            </button>
          </div>

          {/* API Reference */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <Code className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">API Reference</h3>
            <p className="text-gray-600 mb-4">
              Complete API documentation with code examples and endpoints
            </p>
            <button className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              View API Docs
            </button>
          </div>

          {/* Community Forum */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
            <HelpCircle className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Community Forum</h3>
            <p className="text-gray-600 mb-4">
              Ask questions and share knowledge with other users
            </p>
            <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Join Discussion
            </button>
          </div>
        </motion.div>

        {/* Popular Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'How to import emissions data from Excel',
              'Understanding CSRD datapoint requirements',
              'Setting up automated report generation',
              'Integrating with your accounting software',
              'Using AI insights to reduce emissions',
              'Managing team permissions and roles'
            ].map((article, index) => (
              <motion.a
                key={article}
                href="#"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
              >
                <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 group-hover:text-green-600">
                  {article}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
