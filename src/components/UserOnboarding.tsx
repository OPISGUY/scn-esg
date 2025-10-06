import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronRight, 
  ChevronLeft, 
  Building, 
  TreePine, 
  Recycle, 
  BarChart3, 
  Shield, 
  CheckCircle,
  Play
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const UserOnboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();

  const steps = [
    {
      title: "Welcome to Verdant By SCN!",
      icon: <Building className="w-16 h-16 text-green-600" />,
      content: (
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-6">
            Hi {user?.first_name}! We're excited to help {user?.company} start their sustainability journey.
          </p>
          <p className="text-gray-600">
            This quick tour will show you how to track your environmental impact, 
            manage e-waste, purchase carbon offsets, and generate compliance reports.
          </p>
        </div>
      )
    },
    {
      title: "Track Your Carbon Footprint",
      icon: <TreePine className="w-16 h-16 text-green-600" />,
      content: (
        <div>
          <p className="text-gray-700 mb-4">
            Monitor and reduce your organization's carbon emissions with our comprehensive tracking tools:
          </p>
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Track emissions from energy, transportation, and operations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Get AI-powered insights and recommendations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Set and monitor reduction targets</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Manage E-Waste Responsibly",
      icon: <Recycle className="w-16 h-16 text-blue-600" />,
      content: (
        <div>
          <p className="text-gray-700 mb-4">
            Turn your electronic waste into positive environmental impact:
          </p>
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Log and track all electronic waste donations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Calculate environmental impact of recycling</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Generate donation certificates and reports</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "CSRD Compliance Made Easy",
      icon: <Shield className="w-16 h-16 text-purple-600" />,
      content: (
        <div>
          <p className="text-gray-700 mb-4">
            Stay compliant with European Sustainability Reporting Standards (ESRS):
          </p>
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Browse comprehensive ESRS datapoint catalog</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Get AI-powered compliance guidance</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Monitor regulatory updates automatically</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Advanced Analytics & Reporting",
      icon: <BarChart3 className="w-16 h-16 text-orange-600" />,
      content: (
        <div>
          <p className="text-gray-700 mb-4">
            Generate professional reports and gain valuable insights:
          </p>
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Create detailed sustainability reports (PDF, Excel)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Benchmark against industry standards</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
              <span>Track progress with interactive dashboards</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "You're All Set!",
      icon: <CheckCircle className="w-16 h-16 text-green-600" />,
      content: (
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-6">
            Congratulations! You're ready to start your sustainability journey with Verdant By SCN.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">Quick Start Tips:</p>
            <ul className="text-green-700 text-sm mt-2 space-y-1">
              <li>• Start by adding your first carbon footprint entry</li>
              <li>• Explore the CSRD compliance dashboard</li>
              <li>• Check out the AI insights for personalized recommendations</li>
            </ul>
          </div>
          <p className="text-gray-600">
            Need help? Access our comprehensive documentation and support from the main menu.
          </p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Getting Started</h1>
              <p className="text-green-100">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <button
              onClick={skipOnboarding}
              className="text-white/80 hover:text-white text-sm underline"
            >
              Skip tour
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {steps[currentStep].icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {steps[currentStep].title}
            </h2>
          </div>

          <div className="mb-8">
            {steps[currentStep].content}
          </div>

          {/* Interactive Demo Button for certain steps */}
          {(currentStep === 1 || currentStep === 2 || currentStep === 3) && (
            <div className="text-center mb-6">
              <button className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                <Play className="w-4 h-4 mr-2" />
                Try Interactive Demo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentStep 
                    ? 'bg-green-600' 
                    : index < currentStep 
                      ? 'bg-green-300' 
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
