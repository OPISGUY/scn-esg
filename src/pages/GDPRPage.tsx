import PageLayout from '../components/layout/PageLayout';
import { Shield, UserCheck, FileText, Mail, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface Right {
  icon: typeof Shield;
  title: string;
  description: string;
}

export default function GDPRPage() {
  const rights: Right[] = [
    {
      icon: UserCheck,
      title: 'Right to Access',
      description: 'You have the right to request access to the personal data we hold about you and receive a copy of that information.'
    },
    {
      icon: FileText,
      title: 'Right to Rectification',
      description: 'You can request that we correct any inaccurate or incomplete personal data we hold about you.'
    },
    {
      icon: Shield,
      title: 'Right to Erasure',
      description: 'Also known as the "right to be forgotten", you can request deletion of your personal data under certain circumstances.'
    },
    {
      icon: FileText,
      title: 'Right to Restrict Processing',
      description: 'You can request that we restrict the processing of your personal data in certain situations.'
    },
    {
      icon: FileText,
      title: 'Right to Data Portability',
      description: 'You have the right to receive your personal data in a structured, commonly used, and machine-readable format.'
    },
    {
      icon: Shield,
      title: 'Right to Object',
      description: 'You can object to the processing of your personal data where we rely on legitimate interests as our legal basis.'
    },
    {
      icon: Shield,
      title: 'Rights Related to Automated Decision Making',
      description: 'You have rights regarding decisions made about you that are based solely on automated processing.'
    },
    {
      icon: FileText,
      title: 'Right to Lodge a Complaint',
      description: 'You have the right to lodge a complaint with your local data protection authority if you believe your rights have been violated.'
    }
  ];

  return (
    <PageLayout
      title="GDPR Compliance"
      subtitle="Your data protection rights under GDPR"
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
          className="mb-12"
        >
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Verdant By SCN is committed to protecting your personal data and respecting your privacy rights. 
              This page explains your rights under the General Data Protection Regulation (GDPR) and how 
              we ensure compliance with these important data protection laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The GDPR gives individuals in the European Union (and European Economic Area) important rights 
              regarding their personal data. Even if you're not in the EU, we extend these same rights to 
              all our users because we believe everyone deserves strong privacy protections.
            </p>
          </div>
        </motion.div>

        {/* GDPR Compliance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-10 h-10 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900">Our GDPR Commitment</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">Lawful Processing</h4>
              <p className="text-gray-600">
                We only process your data when we have a legal basis to do so (consent, contract, legal obligation, or legitimate interest).
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">Data Minimization</h4>
              <p className="text-gray-600">
                We only collect and process the personal data that is necessary for our specified purposes.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">Transparency</h4>
              <p className="text-gray-600">
                We provide clear information about how we collect, use, and protect your personal data.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">Security</h4>
              <p className="text-gray-600">
                We implement appropriate technical and organizational measures to protect your data.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Data Protection Rights</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {rights.map((right, index) => {
              const Icon = right.icon;
              return (
                <motion.div
                  key={right.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl transition-shadow"
                >
                  <Icon className="w-8 h-8 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{right.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{right.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* How to Exercise Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Exercise Your Rights</h2>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            To exercise any of your data protection rights, please contact our Data Protection Officer (DPO) 
            using the information below. We will respond to your request within one month, although this may 
            be extended by two additional months in complex cases.
          </p>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200">
            <h4 className="font-bold text-gray-900 mb-4">Contact Our DPO:</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-600" />
                <a href="mailto:hello@donatecomputers.uk" className="text-green-600 hover:text-green-700 font-semibold">
                  hello@donatecomputers.uk
                </a>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Mail Address:</div>
                  <div className="text-gray-600">
                    Data Protection Officer<br />
                    Penwood Farm<br />
                    Wakefield<br />
                    United Kingdom
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> To protect your privacy and security, we may need to verify your identity 
              before processing your request. Please include sufficient information to allow us to identify you.
            </p>
          </div>
        </motion.div>

        {/* Data Processing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How We Process Your Data</h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">What Data We Collect</h4>
              <p className="text-gray-600 mb-3">
                We collect personal data that you provide to us (name, email, company information) and 
                automatically collected data (usage data, device information, cookies).
              </p>
              <a href="/privacy" className="text-green-600 hover:text-green-700 font-semibold">
                View Full Privacy Policy →
              </a>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">Why We Process Your Data</h4>
              <p className="text-gray-600 mb-2">We process your personal data for the following purposes:</p>
              <ul className="space-y-2 mt-3">
                <li className="text-gray-600 flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>To provide and maintain our service</span>
                </li>
                <li className="text-gray-600 flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>To communicate with you about our services</span>
                </li>
                <li className="text-gray-600 flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>To improve and personalize your experience</span>
                </li>
                <li className="text-gray-600 flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>To comply with legal obligations</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">How Long We Keep Your Data</h4>
              <p className="text-gray-600">
                We retain your personal data only for as long as necessary to fulfill the purposes outlined 
                in our privacy policy, comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">International Data Transfers</h4>
              <p className="text-gray-600">
                If we transfer your data outside the UK/EU, we ensure appropriate safeguards are in place, 
                such as standard contractual clauses approved by the European Commission.
              </p>
            </div>
          </div>
        </motion.div>

        {/* EU Representative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mb-12 bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-3">EU Representative</h3>
          <p className="text-gray-700 mb-4">
            In accordance with Article 27 of the GDPR, we have appointed an EU representative who can be 
            contacted regarding matters related to the processing of personal data:
          </p>
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-700">
              <strong>EU Representative:</strong> [To be appointed]<br />
              <strong>Address:</strong> [EU Address]<br />
              <strong>Email:</strong> hello@donatecomputers.uk
            </p>
          </div>
        </motion.div>

        {/* Supervisory Authority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-8 text-center"
        >
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Right to Lodge a Complaint</h3>
          <p className="text-purple-100 mb-4">
            If you believe we have not handled your data in accordance with GDPR, you have the right to 
            lodge a complaint with a supervisory authority.
          </p>
          <p className="text-purple-100">
            <strong>UK Supervisory Authority:</strong><br />
            Information Commissioner's Office (ICO)<br />
            <a href="https://ico.org.uk" className="text-white underline hover:text-purple-100">
              ico.org.uk
            </a>
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
