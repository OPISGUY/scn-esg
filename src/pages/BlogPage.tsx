import PageLayout from '../components/layout/PageLayout';
import { Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
}

export default function BlogPage() {
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: '5 Ways to Reduce Scope 3 Emissions in Your Supply Chain',
      excerpt: 'Supply chain emissions often represent the largest portion of a company\'s carbon footprint. Learn practical strategies to engage suppliers and reduce Scope 3 emissions.',
      date: 'March 15, 2025',
      author: 'Sarah Mitchell',
      category: 'Carbon Management',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'CSRD Deadline Approaching: Are You Ready?',
      excerpt: 'The Corporate Sustainability Reporting Directive is here. Understand the requirements, timelines, and how to prepare your organization for compliance.',
      date: 'March 10, 2025',
      author: 'James Chen',
      category: 'CSRD Compliance',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'How We Built a Platform on 100% Recycled Hardware',
      excerpt: 'Behind the scenes of the world\'s first green-powered ESG platform. Learn about our journey to running entirely on recycled hardware and renewable energy.',
      date: 'March 5, 2025',
      author: 'Alex Thompson',
      category: 'Platform Updates',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'The Complete Guide to Carbon Accounting Standards',
      excerpt: 'Navigate the complex landscape of carbon accounting standards including GHG Protocol, ISO 14064, and more. Understand which applies to your business.',
      date: 'February 28, 2025',
      author: 'Dr. Emma Wilson',
      category: 'Sustainability Tips',
      readTime: '10 min read'
    },
    {
      id: 5,
      title: 'AI-Powered ESG: The Future of Sustainability Reporting',
      excerpt: 'How artificial intelligence is transforming sustainability reporting. Discover how AI can help identify reduction opportunities and streamline compliance.',
      date: 'February 22, 2025',
      author: 'Michael Rodriguez',
      category: 'Platform Updates',
      readTime: '4 min read'
    },
    {
      id: 6,
      title: 'Case Study: Manufacturing Giant Reduces Carbon by 40%',
      excerpt: 'Read how a global manufacturing company used our platform to identify emission hotspots and implement targeted reduction strategies.',
      date: 'February 15, 2025',
      author: 'Sarah Mitchell',
      category: 'Case Studies',
      readTime: '8 min read'
    }
  ];

  const categories = [
    'All Posts',
    'Carbon Management',
    'CSRD Compliance',
    'Sustainability Tips',
    'Platform Updates',
    'Case Studies'
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Carbon Management': 'bg-green-100 text-green-800',
      'CSRD Compliance': 'bg-blue-100 text-blue-800',
      'Sustainability Tips': 'bg-purple-100 text-purple-800',
      'Platform Updates': 'bg-amber-100 text-amber-800',
      'Case Studies': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PageLayout
      title="Blog"
      subtitle="Insights, updates, and guides for sustainable business"
    >
      <div className="py-12">
        {/* Categories Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  index === 0
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200"
            >
              {/* Category Badge */}
              <div className="p-6 pb-0">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(post.category)}`}>
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-2 group">
                  Read More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Load More Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-shadow">
            Load More Articles
          </button>
        </motion.div>
      </div>
    </PageLayout>
  );
}
