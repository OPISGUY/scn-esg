// src/components/OnboardingWizard.tsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Circle, Clock, Sparkles } from 'lucide-react';
import { guidanceService, OnboardingStep } from '../services/guidanceService';

interface OnboardingWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOnboardingFlow();
  }, []);

  const loadOnboardingFlow = async () => {
    try {
      setIsLoading(true);
      const data = await guidanceService.getOnboardingFlow();
      setSteps(data.steps);
      setError(null);
    } catch (err) {
      console.error('Failed to load onboarding flow:', err);
      setError('Failed to load onboarding wizard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const isStepComplete = (): boolean => {
    const step = steps[currentStep];
    if (!step) return false;

    // Check if all required questions are answered
    const requiredQuestions = step.questions.filter(q => q.required);
    return requiredQuestions.every(q => {
      const answer = answers[q.id];
      if (q.type === 'boolean') return answer !== undefined;
      if (q.type === 'number') return answer !== undefined && answer !== '';
      return answer !== undefined && answer !== '' && answer !== null;
    });
  };

  const renderQuestion = (question: OnboardingStep['questions'][0]) => {
    const value = answers[question.id];

    // Check show_if condition
    if (question.show_if && !answers[question.show_if]) {
      return null;
    }

    switch (question.type) {
      case 'select':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-sm text-gray-500 mb-2">{question.help_text}</p>
            )}
            <select
              value={value || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an option...</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multi_select':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-sm text-gray-500 mb-2">{question.help_text}</p>
            )}
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option);
                      handleAnswerChange(question.id, newValues);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div key={question.id} className="mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => handleAnswerChange(question.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
              />
              <span className="text-sm font-medium text-gray-700">
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {question.help_text && (
              <p className="text-sm text-gray-500 ml-8 mt-1">{question.help_text}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-sm text-gray-500 mb-2">{question.help_text}</p>
            )}
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value) || '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'text':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-sm text-gray-500 mb-2">{question.help_text}</p>
            )}
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading onboarding wizard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadOnboardingFlow}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  if (!step) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Carbon Footprint Setup
          </h1>
          <p className="text-gray-600">
            Let's set up your first carbon footprint in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, index) => (
              <React.Fragment key={s.step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      index < currentStep
                        ? 'bg-green-500 border-green-500'
                        : index === currentStep
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Circle
                        className={`w-6 h-6 ${
                          index === currentStep ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-600 mt-1">Step {s.step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
              {step.estimated_time && (
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {step.estimated_time}
                </div>
              )}
            </div>
            <p className="text-gray-600">{step.description}</p>
            {step.optional && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                Optional
              </span>
            )}
          </div>

          {/* Questions */}
          {step.questions.length > 0 ? (
            <div className="space-y-4">{step.questions.map(renderQuestion)}</div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                You are all set!
              </p>
              <p className="text-gray-600">
                Your onboarding is complete. Click finish to start adding your emissions data.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {onSkip && currentStep < steps.length - 1 && (
                <button
                  onClick={onSkip}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Skip for now
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!isStepComplete() && !step.final}
                className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
                  isStepComplete() || step.final
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {step.final ? 'Finish' : 'Next'}
                {!step.final && <ArrowRight className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </div>
        </div>

        {/* Skip All Button */}
        {onSkip && !step.final && (
          <div className="text-center mt-6">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip onboarding and explore on my own
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
