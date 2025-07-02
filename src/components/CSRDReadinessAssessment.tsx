import React, { useState, useEffect } from 'react';
import { 
  XCircle, 
  Clock, 
  FileText,
  Brain,
  Target,
  TrendingUp,
  Users,
  Lightbulb
} from 'lucide-react';

// Utility functions
const getESRSCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'E1': 'bg-green-100 text-green-800',
    'E2': 'bg-blue-100 text-blue-800',
    'E3': 'bg-cyan-100 text-cyan-800',
    'E4': 'bg-emerald-100 text-emerald-800',
    'E5': 'bg-teal-100 text-teal-800',
    'S1': 'bg-purple-100 text-purple-800',
    'S2': 'bg-pink-100 text-pink-800',
    'S3': 'bg-rose-100 text-rose-800',
    'S4': 'bg-orange-100 text-orange-800',
    'G1': 'bg-gray-100 text-gray-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

interface MaterialityQuestion {
  id: string;
  esrs_category: string;
  question: string;
  guidance: string;
  response_options: string[];
  impact_if_yes: string;
}

interface ESRSDataPoint {
  id: string;
  esrs_category: string;
  datapoint_code: string;
  datapoint_name: string;
  materiality_level: string;
  data_availability: string;
  data_quality_score: number | null;
  target_completion_date: string | null;
  responsible_person: string;
}

interface ComplianceAction {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string | null;
  progress_percentage: number;
  assigned_to_name: string | null;
  assigned_department: string;
}

interface CSRDAssessmentDetails {
  id: string;
  company_name: string;
  status: string;
  overall_readiness_score: number | null;
  gap_analysis: Record<string, any>;
  priority_actions: any[];
  compliance_timeline: Record<string, any>;
  ai_recommendations: string;
  esrs_datapoints: ESRSDataPoint[];
  compliance_actions: ComplianceAction[];
  csrd_applicable: boolean;
  first_reporting_year: number | null;
}

interface CSRDReadinessAssessmentProps {
  assessmentId: string;
  onComplete: () => void;
  onClose: () => void;
}

const CSRDReadinessAssessment: React.FC<CSRDReadinessAssessmentProps> = ({
  assessmentId,
  onComplete,
  onClose
}) => {
  const [assessment, setAssessment] = useState<CSRDAssessmentDetails | null>(null);
  const [materialityQuestions, setMaterialityQuestions] = useState<MaterialityQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<'overview' | 'materiality' | 'ai_analysis' | 'results'>('overview');
  const [loading, setLoading] = useState(false);
  const [aiAnalysisProgress, setAiAnalysisProgress] = useState(0);

  useEffect(() => {
    fetchAssessmentDetails();
  }, [assessmentId]);

  const fetchAssessmentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/compliance/assessments/${assessmentId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAssessment(data);
      }
    } catch (error) {
      console.error('Error fetching assessment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialityQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/compliance/assessments/${assessmentId}/materiality_questionnaire/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMaterialityQuestions(data.questions || []);
        setCurrentStep('materiality');
      }
    } catch (error) {
      console.error('Error fetching materiality questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitMaterialityResponses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/compliance/assessments/${assessmentId}/submit_materiality_responses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ responses })
      });

      if (response.ok) {
        setCurrentStep('ai_analysis');
        runAIAnalysis();
      }
    } catch (error) {
      console.error('Error submitting materiality responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    try {
      setAiAnalysisProgress(10);
      
      const response = await fetch(`/api/v1/compliance/assessments/${assessmentId}/run_ai_analysis/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAiAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 1000);

      if (response.ok) {
        clearInterval(progressInterval);
        setAiAnalysisProgress(100);
        
        // Fetch updated assessment data
        await fetchAssessmentDetails();
        
        setTimeout(() => {
          setCurrentStep('results');
        }, 1000);
      }
    } catch (error) {
      console.error('Error running AI analysis:', error);
    }
  };

  const handleResponseChange = (questionId: string, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  if (loading && !assessment) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment not found</h3>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CSRD Readiness Assessment</h1>
          <p className="text-gray-600 mt-1">{assessment.company_name}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        {[
          { key: 'overview', label: 'Overview', icon: FileText },
          { key: 'materiality', label: 'Materiality', icon: Target },
          { key: 'ai_analysis', label: 'AI Analysis', icon: Brain },
          { key: 'results', label: 'Results', icon: TrendingUp }
        ].map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.key;
          const isCompleted = ['overview', 'materiality', 'ai_analysis', 'results'].indexOf(currentStep) > index;
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isActive 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : isCompleted
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index < 3 && (
                <div className={`w-8 h-0.5 ml-4 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {currentStep === 'overview' && (
        <OverviewStep 
          assessment={assessment} 
          onNext={() => fetchMaterialityQuestions()}
          loading={loading}
        />
      )}

      {currentStep === 'materiality' && (
        <MaterialityStep
          questions={materialityQuestions}
          responses={responses}
          onResponseChange={handleResponseChange}
          onNext={submitMaterialityResponses}
          onBack={() => setCurrentStep('overview')}
          loading={loading}
        />
      )}

      {currentStep === 'ai_analysis' && (
        <AIAnalysisStep progress={aiAnalysisProgress} />
      )}

      {currentStep === 'results' && (
        <ResultsStep 
          assessment={assessment}
          onComplete={onComplete}
          onRestart={() => setCurrentStep('overview')}
        />
      )}
    </div>
  );
};

// Step Components
const OverviewStep: React.FC<{
  assessment: CSRDAssessmentDetails;
  onNext: () => void;
  loading: boolean;
}> = ({ assessment, onNext, loading }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Assessment Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Company Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">CSRD Applicable:</span>
              <span className={assessment.csrd_applicable ? 'text-green-600' : 'text-gray-600'}>
                {assessment.csrd_applicable ? 'Yes' : 'No'}
              </span>
            </div>
            {assessment.first_reporting_year && (
              <div className="flex justify-between">
                <span className="text-gray-600">First Reporting Year:</span>
                <span className="text-gray-900">{assessment.first_reporting_year}</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Current Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Data Points:</span>
              <span className="text-gray-900">{assessment.esrs_datapoints.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Action Items:</span>
              <span className="text-gray-900">{assessment.compliance_actions.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        onClick={onNext}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Start Materiality Assessment'}
      </button>
    </div>
  </div>
);

const MaterialityStep: React.FC<{
  questions: MaterialityQuestion[];
  responses: Record<string, string>;
  onResponseChange: (questionId: string, response: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}> = ({ questions, responses, onResponseChange, onNext, onBack, loading }) => {
  const canProceed = questions.length > 0 && Object.keys(responses).length >= Math.ceil(questions.length * 0.8);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Materiality Assessment</h2>
        <p className="text-gray-600 mb-6">
          Answer these questions to help determine which ESRS topics are material for your organization.
        </p>

        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="border rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getESRSCategoryColor(question.esrs_category)}`}>
                  {question.esrs_category}
                </span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
                  <p className="text-sm text-gray-600 mb-3">{question.guidance}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {question.response_options.map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={responses[question.id] === option}
                          onChange={(e) => onResponseChange(question.id, e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                  
                  {responses[question.id] === 'Yes' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Impact:</strong> {question.impact_if_yes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed || loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Run AI Analysis'}
        </button>
      </div>
    </div>
  );
};

const AIAnalysisStep: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
      <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-4">AI Analysis in Progress</h2>
      <p className="text-gray-600 mb-6">
        Our AI is analyzing your responses and generating personalized recommendations...
      </p>
      
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
    </div>
  </div>
);

const ResultsStep: React.FC<{
  assessment: CSRDAssessmentDetails;
  onComplete: () => void;
  onRestart: () => void;
}> = ({ assessment, onComplete, onRestart }) => (
  <div className="space-y-6">
    {/* Readiness Score */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {assessment.overall_readiness_score || 0}%
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">CSRD Readiness Score</h2>
        <p className="text-gray-600">
          {assessment.overall_readiness_score && assessment.overall_readiness_score >= 80 
            ? 'Excellent! You\'re well-prepared for CSRD compliance.'
            : assessment.overall_readiness_score && assessment.overall_readiness_score >= 60
            ? 'Good progress! Some areas need attention.'
            : 'Significant preparation needed for CSRD compliance.'}
        </p>
      </div>
    </div>

    {/* Priority Actions */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
        Priority Actions
      </h3>
      <div className="space-y-3">
        {assessment.compliance_actions
          .filter(action => ['critical', 'high'].includes(action.priority))
          .slice(0, 5)
          .map((action) => (
            <div key={action.id} className={`p-3 rounded-lg border ${getPriorityColor(action.priority)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm mt-1">{action.description}</p>
                  <div className="flex items-center mt-2 text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {action.assigned_department}
                    {action.due_date && (
                      <>
                        <Clock className="h-3 w-3 ml-3 mr-1" />
                        {new Date(action.due_date).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(action.priority)}`}>
                  {action.priority.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex justify-between">
      <button
        onClick={onRestart}
        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
      >
        Restart Assessment
      </button>
      <button
        onClick={onComplete}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Complete Assessment
      </button>
    </div>
  </div>
);

export default CSRDReadinessAssessment;
