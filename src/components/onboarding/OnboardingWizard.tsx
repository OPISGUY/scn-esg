import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Save,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CompanyData {
  name: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  sustainabilityGoals: string[];
  reportingRequirements: string[];
  currentChallenges: string[];
}

interface OnboardingWizardProps {
  // No props needed - component manages its own completion
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = () => {
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompanyData>({
    name: user?.company || '',
    industry: '',
    size: '',
    location: '',
    website: '',
    sustainabilityGoals: [],
    reportingRequirements: [],
    currentChallenges: []
  });

  const steps = [
    {
      title: "Welcome to Verdant By SCN!",
      subtitle: "Let's set up your organization profile",
      component: WelcomeStep
    },
    {
      title: "Company Information",
      subtitle: "Tell us about your organization",
      component: CompanyInfoStep
    },
    {
      title: "Sustainability Goals",
      subtitle: "What are your key objectives?",
      component: GoalsStep
    },
    {
      title: "Reporting Requirements",
      subtitle: "Which frameworks do you need to comply with?",
      component: ReportingStep
    },
    {
      title: "Current Challenges",
      subtitle: "What obstacles are you facing?",
      component: ChallengesStep
    },
    {
      title: "Setup Complete!",
      subtitle: "You're ready to start your sustainability journey",
      component: CompletionStep
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('🚀 Starting onboarding completion...');
      console.log('Form data:', formData);
      
      // Convert company size to number of employees
      const employees = convertSizeToEmployees(formData.size);
      
      const onboardingData = {
        company_name: formData.name,
        industry: formData.industry,
        employees,
        sustainability_goals: formData.sustainabilityGoals,
        reporting_requirements: formData.reportingRequirements,
        challenges: formData.currentChallenges
      };
      
      console.log('📝 Sending onboarding data:', onboardingData);
      
      await completeOnboarding(onboardingData);
      
      console.log('✅ Onboarding completed successfully!');
      // Component will automatically redirect to dashboard when 
      // user.is_onboarding_complete becomes true
    } catch (error) {
      console.error('❌ Onboarding completion failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertSizeToEmployees = (size: string): number => {
    switch (size) {
      case '1-10': return 5;
      case '11-50': return 30;
      case '51-200': return 125;
      case '201-500': return 350;
      case '501-1000': return 750;
      case '1000+': return 1500;
      default: return 50;
    }
  };

  const updateFormData = (updates: Partial<CompanyData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Company Info
        return formData.name && formData.industry && formData.size && formData.location;
      case 2: // Goals
        return formData.sustainabilityGoals.length > 0;
      case 3: // Reporting
        return formData.reportingRequirements.length > 0;
      case 4: // Challenges
        return formData.currentChallenges.length > 0;
      default:
        return true;
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{steps[currentStep].title}</h1>
              <p className="text-green-100 text-lg">{steps[currentStep].subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Step {currentStep + 1} of {steps.length}</div>
              <div className="text-2xl font-bold">{Math.round(((currentStep + 1) / steps.length) * 100)}%</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <CurrentStepComponent 
            formData={formData}
            updateFormData={updateFormData}
            user={user}
          />
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 rounded-b-2xl border-t">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 text-red-600 mr-2">⚠️</div>
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
            </div>

            <button
              onClick={nextStep}
              disabled={!isStepValid() || isSubmitting}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const WelcomeStep: React.FC<any> = ({ user }) => (
  <div className="text-center">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Building className="w-10 h-10 text-green-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      Welcome, {user?.first_name}!
    </h2>
    <p className="text-lg text-gray-600 mb-8">
      Let's get your organization set up on Verdant By SCN. This quick setup will help us 
      personalize your experience and provide relevant insights for your sustainability journey.
    </p>
    
    <div className="bg-blue-50 rounded-lg p-6">
      <div className="flex items-start">
        <Info className="w-5 h-5 text-blue-600 mt-1 mr-3" />
        <div className="text-left">
          <h3 className="font-semibold text-blue-900 mb-2">What you'll get:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Customized dashboard for your industry</li>
            <li>• Relevant compliance frameworks and reporting templates</li>
            <li>• Industry-specific sustainability benchmarks</li>
            <li>• Tailored AI insights and recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const CompanyInfoStep: React.FC<any> = ({ formData, updateFormData }) => {
  const industries = [
    'Technology', 'Manufacturing', 'Financial Services', 'Healthcare', 
    'Retail', 'Construction', 'Energy', 'Transportation', 'Education', 
    'Government', 'Non-profit', 'Other'
  ];

  const companySizes = [
    { value: 'startup', label: 'Startup (1-10 employees)' },
    { value: 'small', label: 'Small (11-50 employees)' },
    { value: 'medium', label: 'Medium (51-250 employees)' },
    { value: 'large', label: 'Large (251-1000 employees)' },
    { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter your company name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => updateFormData({ industry: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Size *
          </label>
          <select
            value={formData.size}
            onChange={(e) => updateFormData({ size: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select size</option>
            {companySizes.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website (optional)
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => updateFormData({ website: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://www.company.com"
          />
        </div>
      </div>
    </div>
  );
};

const GoalsStep: React.FC<any> = ({ formData, updateFormData }) => {
  const goalOptions = [
    { id: 'carbon_neutral', label: 'Achieve Carbon Neutrality', icon: Target },
    { id: 'reduce_emissions', label: 'Reduce Carbon Emissions by 50%', icon: Target },
    { id: 'renewable_energy', label: 'Transition to 100% Renewable Energy', icon: Target },
    { id: 'waste_reduction', label: 'Implement Circular Economy Practices', icon: Target },
    { id: 'supply_chain', label: 'Sustainable Supply Chain Management', icon: Target },
    { id: 'employee_engagement', label: 'Employee Sustainability Engagement', icon: Users },
    { id: 'community_impact', label: 'Local Community Environmental Impact', icon: Users },
    { id: 'biodiversity', label: 'Biodiversity Conservation', icon: Target }
  ];

  const toggleGoal = (goalId: string) => {
    const currentGoals = formData.sustainabilityGoals;
    const updatedGoals = currentGoals.includes(goalId)
      ? currentGoals.filter((id: string) => id !== goalId)
      : [...currentGoals, goalId];
    updateFormData({ sustainabilityGoals: updatedGoals });
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Select your organization's key sustainability goals. This helps us provide relevant insights and tracking.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalOptions.map(goal => {
          const Icon = goal.icon;
          const isSelected = formData.sustainabilityGoals.includes(goal.id);
          
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-start">
                <Icon className={`w-5 h-5 mt-1 mr-3 ${
                  isSelected ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <div className={`font-medium ${
                    isSelected ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {goal.label}
                  </div>
                  {isSelected && (
                    <div className="flex items-center mt-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ReportingStep: React.FC<any> = ({ formData, updateFormData }) => {
  const frameworkOptions = [
    { id: 'csrd', label: 'CSRD (Corporate Sustainability Reporting Directive)', description: 'EU mandatory reporting' },
    { id: 'esrs', label: 'ESRS (European Sustainability Reporting Standards)', description: 'Technical standards for CSRD' },
    { id: 'ghg_protocol', label: 'GHG Protocol', description: 'Greenhouse gas accounting standard' },
    { id: 'tcfd', label: 'TCFD', description: 'Task Force on Climate-related Financial Disclosures' },
    { id: 'sasb', label: 'SASB', description: 'Sustainability Accounting Standards Board' },
    { id: 'gri', label: 'GRI', description: 'Global Reporting Initiative' },
    { id: 'cdp', label: 'CDP', description: 'Carbon Disclosure Project' },
    { id: 'sbti', label: 'SBTi', description: 'Science Based Targets initiative' },
    { id: 'none', label: 'No specific requirements yet', description: 'Getting started with sustainability reporting' }
  ];

  const toggleFramework = (frameworkId: string) => {
    const currentFrameworks = formData.reportingRequirements;
    const updatedFrameworks = currentFrameworks.includes(frameworkId)
      ? currentFrameworks.filter((id: string) => id !== frameworkId)
      : [...currentFrameworks, frameworkId];
    updateFormData({ reportingRequirements: updatedFrameworks });
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Which reporting frameworks or standards does your organization need to comply with?
      </p>
      
      <div className="space-y-3">
        {frameworkOptions.map(framework => {
          const isSelected = formData.reportingRequirements.includes(framework.id);
          
          return (
            <button
              key={framework.id}
              onClick={() => toggleFramework(framework.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`font-medium ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {framework.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {framework.description}
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-600 ml-3" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ChallengesStep: React.FC<any> = ({ formData, updateFormData }) => {
  const challengeOptions = [
    { id: 'data_collection', label: 'Data Collection & Management', description: 'Difficulty gathering accurate emissions data' },
    { id: 'expertise', label: 'Lack of Internal Expertise', description: 'Need for sustainability knowledge and skills' },
    { id: 'budget', label: 'Budget Constraints', description: 'Limited resources for sustainability initiatives' },
    { id: 'stakeholder_buy_in', label: 'Stakeholder Buy-in', description: 'Getting leadership and employee engagement' },
    { id: 'supply_chain_complexity', label: 'Supply Chain Complexity', description: 'Managing indirect emissions and vendor data' },
    { id: 'regulatory_compliance', label: 'Regulatory Compliance', description: 'Keeping up with changing requirements' },
    { id: 'measurement_verification', label: 'Measurement & Verification', description: 'Ensuring data accuracy and third-party validation' },
    { id: 'technology_integration', label: 'Technology Integration', description: 'Connecting systems and automating processes' }
  ];

  const toggleChallenge = (challengeId: string) => {
    const currentChallenges = formData.currentChallenges;
    const updatedChallenges = currentChallenges.includes(challengeId)
      ? currentChallenges.filter((id: string) => id !== challengeId)
      : [...currentChallenges, challengeId];
    updateFormData({ currentChallenges: updatedChallenges });
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">
        What are your main challenges with sustainability management? This helps us prioritize features and support.
      </p>
      
      <div className="space-y-3">
        {challengeOptions.map(challenge => {
          const isSelected = formData.currentChallenges.includes(challenge.id);
          
          return (
            <button
              key={challenge.id}
              onClick={() => toggleChallenge(challenge.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                isSelected 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`font-medium ${
                    isSelected ? 'text-orange-900' : 'text-gray-900'
                  }`}>
                    {challenge.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {challenge.description}
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-orange-600 ml-3" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const CompletionStep: React.FC<any> = () => (
  <div className="text-center">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <CheckCircle className="w-10 h-10 text-green-600" />
    </div>
    
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      Welcome to Verdant By SCN!
    </h2>
    
    <p className="text-lg text-gray-600 mb-8">
      Your organization profile has been created. You're now ready to start tracking your 
      sustainability journey and making a positive environmental impact.
    </p>

    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div className="font-medium">Calculate Footprint</div>
          <div className="text-gray-600">Start by measuring your current emissions</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="font-medium">Explore Features</div>
          <div className="text-gray-600">Discover tools tailored to your needs</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Building className="w-6 h-6 text-purple-600" />
          </div>
          <div className="font-medium">Generate Reports</div>
          <div className="text-gray-600">Create compliance-ready documentation</div>
        </div>
      </div>
    </div>
  </div>
);

export default OnboardingWizard;
