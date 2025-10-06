import PageLayout from '../components/layout/PageLayout';
import { Mail, Newspaper, FileText, Image, Sparkles, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PressPage() {
  const pressResources = [
    {
      icon: Image,
      title: 'Brand Assets',
      description: 'Logos, colors, and brand guidelines',
      items: ['SVG Logos', 'PNG Logos', 'Brand Guidelines PDF', 'Color Palette']
    },
    {
      icon: FileText,
      title: 'Company Info',
      description: 'Boilerplate text and key facts',
      items: ['Company Boilerplate', 'Executive Bios', 'Key Statistics', 'Timeline']
    },
    {
      icon: Image,
      title: 'Screenshots',
      description: 'High-resolution product images',
      items: ['Dashboard Views', 'Feature Screenshots', 'Mobile Views', 'Reports']
    }
  ];

  const storyAngles = [
    {
      icon: Sparkles,
      title: 'First Green-Powered ESG Platform',
      description: 'We run entirely on 100% recycled hardware and renewable energy - a unique story in the tech sustainability space.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: TrendingUp,
      title: 'Making ESG Accessible',
      description: 'Breaking down barriers to CSRD compliance for SMEs with affordable, AI-powered sustainability reporting.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Users,
      title: 'Startup Tackling Climate',
      description: 'A new UK startup helping businesses transition to net-zero through technology and transparency.',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <PageLayout
      title="Press & Media"
      subtitle="We're looking for press opportunities to share our story"
    >
      <div className="py-12">
        {/* Press Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 mb-16 shadow-xl"
        >
          <div className="max-w-3xl mx-auto text-center">
            <Mail className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">Let's Tell Our Story Together</h2>
            <p className="text-xl text-green-100 mb-6">
              We're a startup on a mission to make ESG reporting accessible, affordable, and environmentally responsible. 
              We'd love to share our story with your audience.
            </p>
            <a
              href="mailto:hello@donatecomputers.uk"
              className="inline-block bg-white text-green-600 font-bold px-8 py-4 rounded-lg hover:bg-green-50 transition text-lg"
            >
              hello@donatecomputers.uk
            </a>
          </div>
        </motion.div>

        {/* Why Cover Us */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-4 text-center"
          >
            Why Cover Us?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto"
          >
            We're doing something different - building the world's first ESG platform that practices what it preaches.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {storyAngles.map((angle, index) => {
              const Icon = angle.icon;
              return (
                <motion.div
                  key={angle.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow"
                >
                  <div className={`bg-gradient-to-r ${angle.color} text-white p-6 text-center`}>
                    <Icon className="w-12 h-12 mx-auto mb-3" />
                    <h3 className="text-xl font-bold">{angle.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 leading-relaxed">{angle.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Press Kit / Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Press Kit Available
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Download our press kit for logos, screenshots, and company information to accompany your story.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {pressResources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl transition-shadow"
                >
                  <Icon className="w-10 h-10 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {resource.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="mailto:hello@donatecomputers.uk?subject=Press Kit Request"
                    className="block w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition text-center"
                  >
                    Request Access
                  </a>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Company Boilerplate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 bg-gray-50 rounded-2xl p-8 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Boilerplate</h2>
          <div className="bg-white rounded-lg p-6 border border-gray-300">
            <p className="text-gray-700 leading-relaxed mb-4">
              Verdant By SCN is the world's first green-powered ESG platform, running entirely on 100% recycled 
              hardware and renewable energy. Founded in 2025, we're on a mission to make ESG reporting 
              accessible, affordable, and environmentally responsible for businesses of all sizes.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our platform provides comprehensive solutions for carbon management, CSRD compliance, AI-driven 
              sustainability insights, and access to verified carbon credit markets. We help organizations 
              track, report, and reduce their environmental impact through cutting-edge technology.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Based in Wakefield, UK, Verdant By SCN is committed to practicing what we preach - our entire 
              infrastructure runs on donated, recycled computers powered by renewable energy, proving 
              that sustainable technology is both possible and powerful.
            </p>
          </div>
        </motion.div>

        {/* Key Facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Quick Facts</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">Renewable Energy</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">0%</div>
              <div className="text-gray-600">New Hardware</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2025</div>
              <div className="text-gray-600">Founded</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">UK</div>
              <div className="text-gray-600">Based in Wakefield</div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-16 text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-12 border border-gray-200"
        >
          <Newspaper className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Interested in Covering Our Story?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're available for interviews, demos, and can provide additional information or data to support your story.
          </p>
          <a
            href="mailto:hello@donatecomputers.uk?subject=Press Inquiry"
            className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-shadow"
          >
            Get in Touch
          </a>
        </motion.div>
      </div>
    </PageLayout>
  );
}
