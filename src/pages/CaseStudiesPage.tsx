import PageLayout from '../components/layout/PageLayout';
import { TrendingDown, Clock, Building, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CaseStudy {
  id: number;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    carbonReduction: string;
    timeToCompliance: string;
    costSavings: string;
  };
  quote: string;
  quoteAuthor: string;
  quoteRole: string;
}

export default function CaseStudiesPage() {
  const caseStudies: CaseStudy[] = [
    {
      id: 1,
      company: 'Global Manufacturing Corp',
      industry: 'Manufacturing',
      challenge: 'Struggling to track emissions across 45 facilities worldwide. Manual data collection was taking 200+ hours per month with inconsistent accuracy.',
      solution: 'Implemented Verdant By SCN platform with automated data collection and real-time dashboards. Integrated with existing ERP systems for seamless emission tracking.',
      results: {
        carbonReduction: '40%',
        timeToCompliance: '6 months',
        costSavings: '£250,000/year'
      },
      quote: 'Verdant By SCN transformed how we approach sustainability. The AI insights identified reduction opportunities we never knew existed.',
      quoteAuthor: 'Sarah Johnson',
      quoteRole: 'Chief Sustainability Officer'
    },
    {
      id: 2,
      company: 'TechStart Innovation',
      industry: 'Technology',
      challenge: 'Fast-growing startup needed to achieve CSRD compliance for Series B funding round. Limited internal sustainability expertise and tight deadline.',
      solution: 'Used Verdant By SCN\'s guided CSRD compliance workflow with AI-powered gap analysis. Completed all required datapoints with expert support.',
      results: {
        carbonReduction: '25%',
        timeToCompliance: '4 months',
        costSavings: '£80,000/year'
      },
      quote: 'We achieved CSRD compliance 2 months ahead of schedule. The platform made a complex process straightforward and manageable.',
      quoteAuthor: 'David Chen',
      quoteRole: 'Co-Founder & COO'
    },
    {
      id: 3,
      company: 'Retail Excellence Chain',
      industry: 'Retail',
      challenge: 'Large retail chain with 200+ stores needed to offset unavoidable emissions and meet net-zero commitments. Required transparent, verified carbon credits.',
      solution: 'Leveraged Verdant By SCN\'s carbon credit marketplace to purchase verified offsets. Portfolio management tools provided full transparency and reporting.',
      results: {
        carbonReduction: '100% offset',
        timeToCompliance: '2 months',
        costSavings: '£120,000/year'
      },
      quote: 'The carbon marketplace gave us confidence in our offsetting strategy. Every credit is verified and traceable.',
      quoteAuthor: 'Emma Thompson',
      quoteRole: 'Director of Sustainability'
    }
  ];

  return (
    <PageLayout
      title="Case Studies"
      subtitle="Real results from companies transforming their sustainability journey"
    >
      <div className="py-12 space-y-16">
        {caseStudies.map((study, index) => (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{study.company}</h2>
                  <div className="flex items-center gap-2 text-green-100">
                    <Building className="w-5 h-5" />
                    <span className="text-lg">{study.industry}</span>
                  </div>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-bold text-2xl">Case Study #{study.id}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Challenge & Solution */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-red-600">⚠️</span> The Challenge
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {study.challenge}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-green-600">✓</span> The Solution
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {study.solution}
                  </p>
                </div>
              </div>

              {/* Results Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
                >
                  <TrendingDown className="w-10 h-10 text-green-600 mb-3" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {study.results.carbonReduction}
                  </div>
                  <div className="text-gray-600 font-medium">Carbon Reduction</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200"
                >
                  <Clock className="w-10 h-10 text-blue-600 mb-3" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {study.results.timeToCompliance}
                  </div>
                  <div className="text-gray-600 font-medium">Time to Compliance</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
                >
                  <span className="text-4xl mb-3 block">💰</span>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {study.results.costSavings}
                  </div>
                  <div className="text-gray-600 font-medium">Cost Savings</div>
                </motion.div>
              </div>

              {/* Quote */}
              <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-6 border-l-4 border-green-600">
                <p className="text-lg text-gray-700 italic mb-4">
                  "{study.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {study.quoteAuthor.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{study.quoteAuthor}</div>
                    <div className="text-sm text-gray-600">{study.quoteRole}, {study.company}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-12 border border-gray-200"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies achieving their sustainability goals with Verdant By SCN.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-shadow inline-flex items-center gap-2"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </PageLayout>
  );
}
