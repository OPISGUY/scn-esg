import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ESRSDatapoint {
  id: number;
  datapoint_code: string;
  title: string;
  description: string;
  metric_type: string;
  unit: string;
  esrs_standard: string;
  topic_area: string;
  mandatory: boolean;
  complexity_level: string;
  implementation_guidance: string;
  created_at: string;
  updated_at: string;
}

interface ComplianceAssessment {
  id: number;
  company: number;
  esrs_datapoint: number;
  assessment_date: string;
  status: string;
  compliance_score: number;
  evidence_description: string;
  gaps_identified: string;
  action_plan: string;
  created_at: string;
  updated_at: string;
}

interface RegulatoryUpdate {
  id: number;
  title: string;
  description: string;
  effective_date: string;
  impact_level: string;
  source_regulation: string;
  affected_datapoints: string;
  implementation_notes: string;
  created_at: string;
  updated_at: string;
}

const CSRDCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datapoints' | 'assessments' | 'updates'>('datapoints');
  const [datapoints, setDatapoints] = useState<ESRSDatapoint[]>([]);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDatapoint, setExpandedDatapoint] = useState<number | null>(null);

  const API_BASE = `${import.meta.env.VITE_API_URL || 'https://scn-esg-backend.onrender.com'}/api/v1/compliance`;

  useEffect(() => {
    if (activeTab === 'datapoints') {
      fetchDatapoints();
    } else if (activeTab === 'assessments') {
      fetchAssessments();
    } else if (activeTab === 'updates') {
      fetchUpdates();
    }
  }, [activeTab]);

  const fetchDatapoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/esrs-datapoints/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDatapoints(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(`Failed to fetch datapoints: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error fetching datapoints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/assessments/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAssessments(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(`Failed to fetch assessments: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/regulatory-updates/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUpdates(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(`Failed to fetch updates: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error fetching updates:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDatapointExpansion = (id: number) => {
    setExpandedDatapoint(expandedDatapoint === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'non_compliant': return 'text-red-600 bg-red-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'not_assessed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CSRD Compliance Management</h1>
        <p className="text-gray-600">Manage ESRS datapoints, compliance assessments, and regulatory updates</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'datapoints', label: 'ESRS Datapoints', count: datapoints.length },
            { id: 'assessments', label: 'Assessments', count: assessments.length },
            { id: 'updates', label: 'Regulatory Updates', count: updates.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    if (activeTab === 'datapoints') fetchDatapoints();
                    else if (activeTab === 'assessments') fetchAssessments();
                    else if (activeTab === 'updates') fetchUpdates();
                  }}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESRS Datapoints Tab */}
      {activeTab === 'datapoints' && !loading && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">ESRS Datapoint Catalog</h3>
            <p className="text-sm text-blue-700">
              Browse and manage the European Sustainability Reporting Standards (ESRS) datapoints required for CSRD compliance.
            </p>
          </div>

          {datapoints.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>No ESRS datapoints found.</p>
              <p className="text-sm mt-2">Contact your administrator to sync the datapoint catalog.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {datapoints.map((datapoint) => (
                <div key={datapoint.id} className="border border-gray-200 rounded-lg">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleDatapointExpansion(datapoint.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {expandedDatapoint === datapoint.id ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {datapoint.datapoint_code} - {datapoint.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{datapoint.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${datapoint.mandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {datapoint.mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                        <span className="text-xs text-gray-500">{datapoint.esrs_standard}</span>
                      </div>
                    </div>
                  </div>

                  {expandedDatapoint === datapoint.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                          <dl className="text-sm space-y-1">
                            <div>
                              <dt className="inline font-medium text-gray-700">Topic Area: </dt>
                              <dd className="inline text-gray-600">{datapoint.topic_area}</dd>
                            </div>
                            <div>
                              <dt className="inline font-medium text-gray-700">Metric Type: </dt>
                              <dd className="inline text-gray-600">{datapoint.metric_type}</dd>
                            </div>
                            <div>
                              <dt className="inline font-medium text-gray-700">Unit: </dt>
                              <dd className="inline text-gray-600">{datapoint.unit || 'N/A'}</dd>
                            </div>
                            <div>
                              <dt className="inline font-medium text-gray-700">Complexity: </dt>
                              <dd className="inline text-gray-600">{datapoint.complexity_level}</dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Implementation Guidance</h4>
                          <p className="text-sm text-gray-600">{datapoint.implementation_guidance}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compliance Assessments Tab */}
      {activeTab === 'assessments' && !loading && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Compliance Assessments</h3>
            <p className="text-sm text-yellow-700">
              Track your organization's compliance status for each ESRS datapoint requirement.
            </p>
          </div>

          {assessments.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>No compliance assessments found.</p>
              <p className="text-sm mt-2">Start by creating assessments for your ESRS datapoints.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action Plan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(assessment.assessment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assessment.status)}`}>
                          {assessment.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assessment.compliance_score}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {assessment.evidence_description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {assessment.action_plan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Regulatory Updates Tab */}
      {activeTab === 'updates' && !loading && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-green-800 mb-2">Regulatory Updates</h3>
            <p className="text-sm text-green-700">
              Stay informed about changes to CSRD and ESRS requirements that may affect your compliance obligations.
            </p>
          </div>

          {updates.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>No regulatory updates found.</p>
              <p className="text-sm mt-2">Updates will appear here when new regulations are published.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{update.title}</h3>
                      <p className="text-gray-600 mb-4">{update.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Effective Date: </span>
                          <span className="text-gray-600">
                            {new Date(update.effective_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Source: </span>
                          <span className="text-gray-600">{update.source_regulation}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Affected Datapoints: </span>
                          <span className="text-gray-600">{update.affected_datapoints}</span>
                        </div>
                      </div>

                      {update.implementation_notes && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-700 mb-2">Implementation Notes</h4>
                          <p className="text-sm text-gray-600">{update.implementation_notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${getImpactColor(update.impact_level)}`}>
                        {update.impact_level} Impact
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSRDCompliance;
