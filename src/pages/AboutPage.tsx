import PageLayout from '../components/layout/PageLayout';
import { Leaf, Users, Award, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <PageLayout 
      title="About Verdant By SCN" 
      subtitle="The world's first green-powered ESG platform on recycled hardware"
    >
      <div className="prose prose-lg max-w-none">
        {/* Mission Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900 m-0">Our Mission</h2>
          </div>
          <p className="text-xl text-gray-700 leading-relaxed m-0">
            To empower organizations with sustainable compliance solutions while practicing what we preach—running our entire platform on 100% renewable energy and recycled hardware.
          </p>
        </div>

        {/* Story Section */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          Founded in 2025, Verdant By SCN was born from a simple observation: the ESG industry was helping companies track their environmental impact, yet most platforms themselves consumed massive amounts of energy and resources through traditional cloud infrastructure.
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">
          We decided to change that. By building our entire platform on refurbished, recycled server hardware powered exclusively by renewable energy, we've created the world's first truly green ESG platform. Every calculation you make, every report you generate, and every insight you receive runs on infrastructure that's kind to our planet.
        </p>

        {/* Values */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 mt-12">Our Values</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border-2 border-green-100 shadow-sm">
            <Leaf className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainability First</h3>
            <p className="text-gray-600">
              We don't just help you track sustainability—we embody it in everything we do, from our infrastructure to our business practices.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-blue-100 shadow-sm">
            <Users className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency</h3>
            <p className="text-gray-600">
              We believe in open, honest communication about our environmental impact, our methodologies, and our progress.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-purple-100 shadow-sm">
            <Award className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
            <p className="text-gray-600">
              Sustainability shouldn't mean compromising on quality. We deliver enterprise-grade solutions with zero environmental guilt.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-emerald-100 shadow-sm">
            <Target className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Impact</h3>
            <p className="text-gray-600">
              Every decision we make is measured against its environmental and social impact. We're accountable to our planet first.
            </p>
          </div>
        </div>

        {/* Impact Numbers */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-10 text-white my-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Environmental Impact</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-green-100">Tonnes CO₂ Saved Annually</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-green-100">Renewable Energy</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">0%</div>
              <div className="text-green-100">New Hardware Purchases</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Journey</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          We're a diverse team of sustainability experts, software engineers, and environmental scientists united by a common goal: making ESG compliance accessible, actionable, and genuinely sustainable.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Want to be part of the movement? <a href="/careers" className="text-green-600 hover:text-green-700 font-semibold">View our open positions</a> or <a href="/contact" className="text-green-600 hover:text-green-700 font-semibold">get in touch</a>.
        </p>
      </div>
    </PageLayout>
  );
}
