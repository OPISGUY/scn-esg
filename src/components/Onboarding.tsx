import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, Play, BarChart3, FileText, Lightbulb } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Verdant By SCN!',
      description: 'Your comprehensive sustainability management solution',
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h3>
            <p className="text-gray-600">
              Let's take a quick tour of your new ESG platform to help you get started.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-4 rounded-lg">
              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">Track Impact</div>
              <div className="text-gray-600">Monitor carbon footprint and sustainability metrics</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold">Generate Reports</div>
              <div className="text-gray-600">Create professional ESG and CSRD compliance reports</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Dashboard Overview',
      description: 'Your central hub for all sustainability data',
      content: (
        <div>
          <div className="mb-6">
            <img 
              src="/api/placeholder/600/300" 
              alt="Dashboard Preview" 
              className="w-full rounded-lg border border-gray-200 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Real-time Insights</h3>
            <p className="text-gray-600">
              Your dashboard provides real-time visibility into your organization's environmental impact, 
              compliance status, and sustainability progress.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span>Track carbon emissions across all operations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <span>Monitor e-waste donations and recycling</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>
              <span>View compliance status and action items</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Carbon Footprint Tracking',
      description: 'Measure and reduce your environmental impact',
      content: (
        <div>
          <div className="mb-6">
            <div className="bg-green-50 p-6 rounded-lg mb-4">
              <h3 className="text-xl font-semibold mb-2 text-green-800">Carbon Calculator</h3>
              <p className="text-green-700">
                Input your energy consumption, transportation, and operational data to calculate 
                your organization's carbon footprint automatically.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-800">Scope 1</div>
                <div className="text-gray-600">Direct emissions</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-800">Scope 2</div>
                <div className="text-gray-600">Energy indirect</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-800">Scope 3</div>
                <div className="text-gray-600">Other indirect</div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-800">Pro Tip</div>
                <div className="text-yellow-700 text-sm">
                  Use our AI-powered insights to identify the biggest opportunities for carbon reduction.
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'CSRD Compliance',
      description: 'Stay compliant with EU sustainability regulations',
      content: (
        <div>
          <div className="mb-6">
            <div className="bg-blue-50 p-6 rounded-lg mb-4">
              <h3 className="text-xl font-semibold mb-2 text-blue-800">ESRS Datapoints</h3>
              <p className="text-blue-700">
                Browse and complete the European Sustainability Reporting Standards (ESRS) 
                datapoints required for CSRD compliance.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">E1 - Climate Change</span>
                <span className="text-sm text-gray-600">Environmental</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">S1 - Own Workforce</span>
                <span className="text-sm text-gray-600">Social</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">G1 - Business Conduct</span>
                <span className="text-sm text-gray-600">Governance</span>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-semibold text-purple-800">Automated Reporting</div>
                <div className="text-purple-700 text-sm">
                  Generate professional CSRD-compliant reports with just a few clicks.
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations for your sustainability journey',
      content: (
        <div>
          <div className="mb-6">
            <div className="bg-purple-50 p-6 rounded-lg mb-4">
              <h3 className="text-xl font-semibold mb-2 text-purple-800">Smart Analytics</h3>
              <p className="text-purple-700">
                Our AI analyzes your data to provide personalized insights, identify trends, 
                and recommend actions to improve your sustainability performance.
              </p>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-semibold">Opportunity Identified</span>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  "Switching to renewable energy could reduce your Scope 2 emissions by 45%"
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold">Trend Analysis</span>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  "Your carbon intensity has improved by 12% compared to last quarter"
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ready to Begin!',
      description: 'Start your sustainability journey today',
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You're Ready!</h3>
            <p className="text-gray-600 mb-6">
              You now have everything you need to start managing your organization's sustainability effectively.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Quick Start Checklist:</h4>
              <div className="text-left space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Set up your company profile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Input your first carbon footprint data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Explore CSRD compliance requirements</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Generate your first sustainability report</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Need help? Check out our documentation or contact support anytime.
          </div>
        </div>
      ),
    },
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

  const skipTour = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 relative">
          <button
            onClick={skipTour}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="pr-8">
            <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
            <p className="opacity-90 mt-1">{steps[currentStep].description}</p>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm opacity-75 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between">
          <button
            onClick={skipTour}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Skip Tour
          </button>
          
          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-medium"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
