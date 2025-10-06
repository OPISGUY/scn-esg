import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs: FAQItem[] = [
    {
      question: "What's included in the free trial?",
      answer: "The 14-day free trial includes full access to all features of your chosen plan. No credit card required to start, and you can cancel anytime."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! You can cancel your subscription at any time with no penalties. If you cancel, you'll have access until the end of your current billing period."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level encryption, are SOC 2 compliant, and follow strict GDPR guidelines. Your data is encrypted both in transit and at rest."
    },
    {
      question: "Do you support my country's regulations?",
      answer: "We're built for CSRD compliance (EU) and also support GRI, CDP, TCFD, and other international frameworks. Contact us for specific regulatory requirements."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and for Enterprise customers, we offer invoicing options."
    },
    {
      question: "Can I upgrade or downgrade later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference."
    },
    {
      question: "How many users can I add?",
      answer: "Starter plans include 1 user, Professional up to 5 users, and Enterprise supports unlimited users with per-user pricing."
    },
    {
      question: "Do you offer API access?",
      answer: "Yes, API access is available on the Enterprise plan. We offer both REST and GraphQL APIs with comprehensive documentation."
    },
    {
      question: "What kind of support do you provide?",
      answer: "Starter gets email support (48hr response), Professional gets priority email (24hr response), and Enterprise gets dedicated support with phone and chat access."
    },
    {
      question: "Can I import existing data?",
      answer: "Yes! You can import data via CSV/Excel files, connect to your ERP system, or use our API. We also offer white-glove migration assistance for Enterprise customers."
    },
  ];
  
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Verdant By SCN
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className="text-green-600 text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
