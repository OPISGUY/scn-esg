import PageLayout from '../components/layout/PageLayout';

export default function TermsPage() {
  return (
    <PageLayout 
      title="Terms of Service" 
      subtitle="Please read these terms carefully before using our platform"
    >
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-500 mb-8">Last updated: October 6, 2025</p>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-lg font-semibold text-blue-900 m-0">
            By accessing or using Verdant By SCN, you agree to be bound by these Terms of Service.
          </p>
        </div>

        <h2>1. Acceptance of Terms</h2>
        <p>These Terms of Service ("Terms") govern your access to and use of the Verdant By SCN platform, including our website, APIs, and services. By creating an account, you accept these Terms in full.</p>

        <h2>2. Description of Service</h2>
        <p>Verdant By SCN provides an ESG intelligence platform that enables organizations to:</p>
        <ul>
          <li>Track carbon emissions across Scope 1, 2, and 3</li>
          <li>Manage e-waste and circular economy initiatives</li>
          <li>Ensure CSRD compliance with automated datapoint tracking</li>
          <li>Generate sustainability reports and AI-powered insights</li>
          <li>Access carbon offset marketplaces</li>
        </ul>

        <h2>3. Account Registration</h2>
        <p>To use our platform, you must:</p>
        <ul>
          <li>Be at least 18 years old or have parental consent</li>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorized access</li>
        </ul>
        <p>You are responsible for all activities that occur under your account.</p>

        <h2>4. Subscription Plans and Billing</h2>
        <ul>
          <li><strong>Free Tier:</strong> Limited features, no credit card required</li>
          <li><strong>Paid Plans:</strong> Billed monthly or annually as selected</li>
          <li><strong>Auto-Renewal:</strong> Subscriptions renew automatically unless canceled</li>
          <li><strong>Refunds:</strong> Pro-rated refunds available within 14 days of initial purchase</li>
          <li><strong>Price Changes:</strong> We'll notify you 30 days before any price increases</li>
        </ul>

        <h2>5. Acceptable Use Policy</h2>
        <p>You agree <strong>NOT</strong> to:</p>
        <ul>
          <li>Upload false or misleading ESG data</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use the platform for illegal activities</li>
          <li>Reverse engineer, decompile, or disassemble our software</li>
          <li>Resell or redistribute our services without authorization</li>
          <li>Scrape, crawl, or harvest data from our platform</li>
        </ul>
        <p>Violation may result in immediate account termination.</p>

        <h2>6. Intellectual Property</h2>
        <p>Verdant By SCN retains all rights, title, and interest in:</p>
        <ul>
          <li>Platform software, code, and infrastructure</li>
          <li>Brand names, logos, trademarks</li>
          <li>AI models, algorithms, and methodologies</li>
          <li>Documentation, reports, and templates</li>
        </ul>
        <p>You retain ownership of your ESG data. We use it solely to provide services to you.</p>

        <h2>7. Data Accuracy and Liability</h2>
        <p><strong>Important:</strong> While we strive for accuracy, Verdant By SCN:</p>
        <ul>
          <li>Provides tools for ESG tracking, not professional advice</li>
          <li>Cannot guarantee 100% accuracy of AI-generated insights</li>
          <li>Is not liable for decisions made based on platform data</li>
          <li>Recommends consulting qualified ESG professionals for critical decisions</li>
        </ul>

        <h2>8. Termination</h2>
        <p>Either party may terminate this agreement:</p>
        <ul>
          <li><strong>You:</strong> By canceling your subscription via account settings</li>
          <li><strong>Us:</strong> For breach of Terms, non-payment, or illegal activity</li>
        </ul>
        <p>Upon termination, you lose access to the platform. We'll provide a 30-day grace period to export your data.</p>

        <h2>9. Warranty Disclaimer</h2>
        <p className="font-semibold">THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

        <h2>10. Limitation of Liability</h2>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, VERDANT BY SCN SHALL NOT BE LIABLE FOR:</p>
        <ul>
          <li>Indirect, incidental, or consequential damages</li>
          <li>Loss of profits, data, or business opportunities</li>
          <li>Damages exceeding fees paid in the last 12 months</li>
        </ul>

        <h2>11. Indemnification</h2>
        <p>You agree to indemnify Verdant By SCN from claims arising from:</p>
        <ul>
          <li>Your violation of these Terms</li>
          <li>Infringement of third-party rights</li>
          <li>Misuse of the platform</li>
        </ul>

        <h2>12. Changes to Terms</h2>
        <p>We may update these Terms periodically. Continued use after changes constitutes acceptance. Material changes will be communicated via email 30 days in advance.</p>

        <h2>13. Governing Law</h2>
        <p>These Terms are governed by the laws of England and Wales. Disputes will be resolved in UK courts.</p>

        <h2>14. Contact</h2>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 not-prose">
          <p className="m-0">Questions about these Terms?</p>
          <p className="m-0 mt-2"><strong>Email:</strong> <a href="mailto:hello@donatecomputers.uk">hello@donatecomputers.uk</a></p>
        </div>
      </div>
    </PageLayout>
  );
}
