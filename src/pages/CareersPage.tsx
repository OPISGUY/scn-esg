import PageLayout from '../components/layout/PageLayout';
import { Briefcase, MapPin, Clock, TrendingUp } from 'lucide-react';

export default function CareersPage() {
  const openings: any[] = [];

  const benefits = [
    '🌱 Work on the world\'s greenest ESG platform',
    '💚 Competitive salary + equity options',
    '🏖️ Unlimited PTO (minimum 25 days)',
    '🏠 Remote-first culture',
    '🌍 Annual sustainability impact bonus',
    '📚 Learning & development budget',
    '🧘 Mental health & wellness support',
    '♻️ Carbon offset for your commute',
  ];

  return (
    <PageLayout 
      title="Careers at Verdant By SCN" 
      subtitle="Build the future of sustainable compliance"
    >
      <div className="space-y-12">
        {/* Intro */}
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 leading-relaxed">
            Join a team that's redefining what it means to be an ESG platform. We're not just tracking sustainability—we're living it every day with our green-powered, recycled hardware infrastructure.
          </p>
        </div>

        {/* Why Join Us */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Work With Us?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-700">
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Open Positions</h2>
          {openings.length === 0 ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-12 text-center border border-blue-100">
              <Briefcase className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Open Positions at the Moment</h3>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                We're not actively hiring right now, but we're always interested in connecting with talented individuals who share our passion for sustainability.
              </p>
              <p className="text-gray-600 mb-8">
                If you'd like to be considered for future opportunities, please send your CV and a brief introduction to:
              </p>
              <a
                href="mailto:hello@donatecomputers.uk?subject=Future Opportunities"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
              >
                <Briefcase className="w-5 h-5" />
                hello@donatecomputers.uk
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {openings.map((job, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 md:mb-0">{job.title}</h3>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                      {job.department}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {job.type}
                    </div>
                  </div>
                  <div className="mt-4">
                    <a
                      href={`mailto:hello@donatecomputers.uk?subject=Application for ${job.title}`}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      <Briefcase className="w-4 h-4" />
                      Apply Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Don't See a Fit */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-10 text-white text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
          <p className="text-xl text-green-50 mb-6 max-w-2xl mx-auto">
            We're always looking for talented, passionate people. Send us your CV and tell us how you'd like to contribute to our mission.
          </p>
          <a
            href="mailto:hello@donatecomputers.uk?subject=General Application"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
