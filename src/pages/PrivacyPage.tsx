import PageLayout from '../components/layout/PageLayout';
import { Shield, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <PageLayout 
      title="Privacy Policy" 
      subtitle="How we protect and handle your data"
    >
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-500 mb-8">Last updated: October 6, 2025</p>

        <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8">
          <p className="text-lg font-semibold text-green-900 m-0">
            Your privacy matters. We're committed to transparency about how we collect, use, and protect your data.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-900">GDPR Compliant</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <Lock className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-900">Encrypted</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-900">Transparent</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-900">Secure</div>
          </div>
        </div>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, including:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email, company details, phone number</li>
          <li><strong>ESG Data:</strong> Carbon emissions, e-waste tracking, compliance datapoints</li>
          <li><strong>Usage Data:</strong> How you interact with our platform, features used, time spent</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our ESG platform</li>
          <li>Generate sustainability reports and AI insights</li>
          <li>Communicate with you about updates, features, and support</li>
          <li>Ensure compliance with CSRD and other ESG regulations</li>
          <li>Protect against fraud and unauthorized access</li>
        </ul>

        <h2>3. Data Sharing and Disclosure</h2>
        <p>We <strong>never</strong> sell your personal data. We may share information in limited circumstances:</p>
        <ul>
          <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
          <li><strong>Service Providers:</strong> Third parties who help us operate (cloud hosting, analytics)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
          <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We implement robust security measures:</p>
        <ul>
          <li>End-to-end encryption for data in transit and at rest</li>
          <li>Regular security audits and penetration testing</li>
          <li>ISO 27001 certified data centers</li>
          <li>Role-based access controls and 2FA authentication</li>
          <li>Green, recycled hardware infrastructure (still enterprise-grade secure!)</li>
        </ul>

        <h2>5. Your Rights (GDPR)</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Correct inaccurate information</li>
          <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
          <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
          <li><strong>Objection:</strong> Object to certain processing activities</li>
          <li><strong>Restriction:</strong> Limit how we use your data</li>
        </ul>
        <p>To exercise these rights, contact us at <a href="mailto:hello@donatecomputers.uk">hello@donatecomputers.uk</a>.</p>

        <h2>6. Cookies and Tracking</h2>
        <p>We use cookies to improve your experience:</p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
          <li><strong>Analytics Cookies:</strong> Help us understand usage patterns (opt-out available)</li>
          <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
        </ul>
        <p>You can manage cookie preferences in your browser settings or via our <a href="/cookie-policy">Cookie Policy</a>.</p>

        <h2>7. Data Retention</h2>
        <p>We retain your data for as long as your account is active or as needed to provide services. When you delete your account, we will:</p>
        <ul>
          <li>Permanently delete personal data within 30 days</li>
          <li>Retain aggregated, anonymized data for analytics</li>
          <li>Keep compliance-related records as legally required</li>
        </ul>

        <h2>8. International Transfers</h2>
        <p>Your data is processed in the UK/EU. If transferred outside these regions, we ensure adequate safeguards through:</p>
        <ul>
          <li>Standard Contractual Clauses (SCCs)</li>
          <li>Adequacy decisions by the European Commission</li>
          <li>Your explicit consent where required</li>
        </ul>

        <h2>9. Children's Privacy</h2>
        <p>Our platform is not intended for users under 16. We do not knowingly collect data from children. If you believe we have inadvertently collected such data, please contact us immediately.</p>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy periodically. We'll notify you of significant changes via:</p>
        <ul>
          <li>Email to your registered address</li>
          <li>Prominent notice on our platform</li>
          <li>In-app notifications</li>
        </ul>

        <h2>11. Contact Us</h2>
        <p>Questions about this Privacy Policy? Reach out to our Data Protection Officer:</p>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 not-prose">
          <p className="m-0"><strong>Email:</strong> <a href="mailto:hello@donatecomputers.uk">hello@donatecomputers.uk</a></p>
          <p className="m-0 mt-2"><strong>Mail:</strong> Data Protection Officer, Verdant By SCN, Penwood Farm, Wakefield, United Kingdom</p>
        </div>
      </div>
    </PageLayout>
  );
}
