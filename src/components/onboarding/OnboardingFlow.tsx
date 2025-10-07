/**
 * OnboardingFlow Component
 * 
 * Multi-step onboarding wizard that collects user information
 * before directing to payment or account creation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingFlowProps {
  selectedTier: 'free' | 'starter' | 'professional' | 'enterprise';
  tierPrice: number;
  currency: string;
  onComplete: (userData: UserData) => void;
  onCancel: () => void;
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companySize: string;
  industry: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  selectedTier,
  tierPrice,
  currency,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    companySize: '',
    industry: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<UserData>>({});

  const requiresPasswordStep = selectedTier !== 'enterprise';
  const totalSteps = requiresPasswordStep ? 3 : 3;

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<UserData> = {};

    if (currentStep === 1) {
      if (!userData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!userData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!userData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    if (currentStep === 2) {
      if (!userData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!userData.companySize) newErrors.companySize = 'Please select company size';
      if (!userData.industry) newErrors.industry = 'Please select an industry';
    }

    if (currentStep === 3 && requiresPasswordStep) {
      if (!userData.password) {
        newErrors.password = 'Password is required';
      } else if (userData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!userData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (userData.password !== userData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        onComplete(userData);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const updateUserData = (field: keyof UserData, value: string) => {
    setUserData({ ...userData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const getTierDisplayName = () => {
    return selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1);
  };

  const formatPrice = () => {
    const symbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€' };
    const symbol = symbols[currency] || currency;
    if (selectedTier === 'free') return 'Free';
    if (selectedTier === 'enterprise') return `${symbol}${tierPrice}/user/month`;
    return `${symbol}${tierPrice}/month`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Verdant By SCN! 🎉</h2>
              <p className="text-green-100">Let's set up your account</p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-200 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Selected Plan Badge */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-sm text-green-100">Selected Plan</p>
              <p className="text-lg font-bold">{getTierDisplayName()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatPrice()}</p>
              {selectedTier !== 'free' && (
                <p className="text-xs text-green-100">14-day free trial</p>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((step / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Tell us about yourself
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => updateUserData('firstName', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => updateUserData('lastName', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Smith"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => updateUserData('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john.smith@company.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send your login credentials here
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  About your organization
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={userData.companyName}
                    onChange={(e) => updateUserData('companyName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Acme Corporation"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size *
                  </label>
                  <select
                    value={userData.companySize}
                    onChange={(e) => updateUserData('companySize', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.companySize ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select size...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1001+">1001+ employees</option>
                  </select>
                  {errors.companySize && (
                    <p className="text-red-500 text-xs mt-1">{errors.companySize}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry *
                  </label>
                  <select
                    value={userData.industry}
                    onChange={(e) => updateUserData('industry', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.industry ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select industry...</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance & Banking</option>
                    <option value="Retail">Retail & E-commerce</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Energy">Energy & Utilities</option>
                    <option value="Construction">Construction</option>
                    <option value="Transportation">Transportation & Logistics</option>
                    <option value="Food">Food & Beverage</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.industry && (
                    <p className="text-red-500 text-xs mt-1">{errors.industry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => updateUserData('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+44 20 1234 5678"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {requiresPasswordStep ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Secure your account
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={userData.password}
                        onChange={(e) => updateUserData('password', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Create a secure password"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={userData.confirmPassword}
                        onChange={(e) => updateUserData('confirmPassword', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Re-enter your password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Keep your Verdant account secure.</strong>
                      </p>
                      <p className="text-sm text-blue-700 mt-2">
                        You'll use these credentials to sign in once your plan is ready.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Enterprise Contact
                    </h3>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Thank you for your interest in our Enterprise plan!</strong>
                      </p>
                      <p className="text-sm text-blue-700 mt-2">
                        Our sales team will contact you shortly to discuss:
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                        <li>Custom pricing based on your team size</li>
                        <li>Dedicated account manager</li>
                        <li>White-label options</li>
                        <li>API access and integrations</li>
                        <li>Priority support and training</li>
                      </ul>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-6 flex justify-between items-center border-t pt-4">
          <button
            onClick={handleBack}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
          >
            ← {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
          >
            {step === totalSteps ? (
              selectedTier === 'free' ? 'Create Account' : 
              selectedTier === 'enterprise' ? 'Submit Request' : 
              'Continue to Payment'
            ) : (
              'Next →'
            )}
          </button>
        </div>

        {/* Security Badge */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Your information is secure and encrypted
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;
