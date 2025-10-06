import PageLayout from '../components/layout/PageLayout';
import { Mail, HelpCircle, Video, MessageSquare, Book, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SupportChannel {
  icon: typeof Mail;
  title: string;
  description: string;
  action: string;
  actionUrl: string;
  responseTime: string;
  color: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function SupportPage() {
  const supportChannels: SupportChannel[] = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email from our expert support team',
      action: 'hello@donatecomputers.uk',
      actionUrl: 'mailto:hello@donatecomputers.uk',
      responseTime: 'Within 24 hours',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Book,
      title: 'Help Center',
      description: 'Browse our comprehensive knowledge base',
      action: 'Browse Articles',
      actionUrl: '/docs',
      responseTime: 'Instant access',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides and walkthroughs',
      action: 'Watch Tutorials',
      actionUrl: '#',
      responseTime: 'On-demand',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: MessageSquare,
      title: 'Community Forum',
      description: 'Ask questions and connect with other users',
      action: 'Join Community',
      actionUrl: '#',
      responseTime: 'Community-driven',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const faqs: FAQ[] = [
    {
      question: 'How do I import my emissions data?',
      answer: 'You can import data via Excel upload, CSV files, or our API. Go to Dashboard → Import Data, select your file format, and follow the guided wizard. Our system supports common emissions calculation tools and accounting software exports.'
    },
    {
      question: 'What emissions factors do you use?',
      answer: 'We use the latest DEFRA, EPA, and IEA emissions factors, updated annually. Our database includes over 10,000 emissions factors covering energy, transport, materials, and more. You can also add custom factors for your specific activities.'
    },
    {
      question: 'How do I generate a compliance report?',
      answer: 'Navigate to Reports → Generate Report, select your reporting framework (CSRD, GRI, CDP, etc.), choose the time period, and click Generate. Reports are created instantly and can be downloaded as PDF or Excel.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes! All your data can be exported at any time. Go to Settings → Data Export and choose your format (Excel, CSV, JSON). Enterprise customers can also use our API for automated data extraction.'
    },
    {
      question: 'What integrations are available?',
      answer: 'We integrate with major accounting software (Xero, QuickBooks, Sage), cloud providers (AWS, Azure, Google Cloud), and communication tools (Slack, Teams). Visit our Integrations page for the full list and setup guides.'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel anytime from Settings → Billing → Cancel Subscription. Your data remains accessible until the end of your billing period, and you can export everything before canceling. No cancellation fees apply.'
    }
  ];

  return (
    <PageLayout
      title="Support"
      subtitle="We're here to help you succeed"
    >
      <div className="py-12">
        {/* Support Channels */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all"
              >
                {/* Icon Header */}
                <div className={`bg-gradient-to-r ${channel.color} text-white p-6 text-center`}>
                  <Icon className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-xl font-bold">{channel.title}</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 min-h-[48px]">
                    {channel.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{channel.responseTime}</span>
                  </div>

                  <a
                    href={channel.actionUrl}
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition"
                  >
                    {channel.action}
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                    <span className="font-bold text-gray-900 text-lg flex items-center gap-3">
                      <HelpCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      {faq.question}
                    </span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pt-2">
                    <p className="text-gray-600 leading-relaxed pl-9">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Still Need Help CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-12 border border-gray-200"
        >
          <HelpCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still Need Help?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our support team is ready to assist you with any questions or issues.
          </p>
          <a
            href="mailto:hello@donatecomputers.uk"
            className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-shadow"
          >
            Contact Support Team
          </a>
        </motion.div>
      </div>
    </PageLayout>
  );
}
