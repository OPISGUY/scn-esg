import React from 'react';
import HeroSection from './HeroSection';
import SocialProofSection from './SocialProofSection';
import ProblemSolutionSection from './ProblemSolutionSection';
import GreenCommitmentSection from './GreenCommitmentSection';
import FeaturesShowcase from './FeaturesShowcase';
import DataImportSection from './DataImportSection';
import PricingSection from './PricingSection';
import HowItWorksSection from './HowItWorksSection';
import IntegrationsSection from './IntegrationsSection';
import FAQSection from './FAQSection';
import FinalCTASection from './FinalCTASection';
import Footer from './Footer';
import { GreenCommitmentBanner } from '../branding/GreenBadges';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <GreenCommitmentBanner />
      <HeroSection />
      <SocialProofSection />
      <GreenCommitmentSection />
      <ProblemSolutionSection />
      <FeaturesShowcase />
      <DataImportSection />
      <PricingSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
