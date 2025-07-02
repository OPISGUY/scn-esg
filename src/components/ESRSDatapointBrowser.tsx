import React, { useState, useEffect } from 'react';
import { Search, Book, Target, AlertCircle, CheckCircle, Filter, Download } from 'lucide-react';

interface ESRSDatapoint {
  id: number;
  code: string;
  name: string;
  description: string;
  standard: string;
  section: string;
  disclosure_requirement: string;
  data_type: string;
  unit: string | null;
  mandatory: boolean;
  category: string;
  ai_guidance: string;
  collection_questions: string[];
}

interface DatapointHierarchy {
  [standard: string]: {
    [section: string]: ESRSDatapoint[];
  };
}

const ESRSDatapointBrowser: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<DatapointHierarchy>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDatapoint, setSelectedDatapoint] = useState<ESRSDatapoint | null>(null);
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set());
  const [showMandatoryOnly, setShowMandatoryOnly] = useState(false);

  useEffect(() => {
    fetchDatapointHierarchy();
  }, []);

  const fetchDatapointHierarchy = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/esrs-datapoints/hierarchy/');
      if (!response.ok) throw new Error('Failed to fetch datapoint hierarchy');
      
      const data = await response.json();
      setHierarchy(data);
      
      // Expand all standards by default
      setExpandedStandards(new Set(Object.keys(data)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStandard = (standard: string) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(standard)) {
      newExpanded.delete(standard);
    } else {
      newExpanded.add(standard);
    }
    setExpandedStandards(newExpanded);
  };

  const filterDatapoints = (datapoints: ESRSDatapoint[]): ESRSDatapoint[] => {
    return datapoints.filter(dp => {
      const matchesSearch = !searchQuery || 
        dp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dp.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || dp.category === selectedCategory;
      const matchesMandatory = !showMandatoryOnly || dp.mandatory;
      
      return matchesSearch && matchesCategory && matchesMandatory;
    });
  };

  const getStandardColor = (standard: string): string => {
    const colors: { [key: string]: string } = {
      'ESRS E1': 'bg-green-100 text-green-800 border-green-200',
      'ESRS E2': 'bg-blue-100 text-blue-800 border-blue-200',
      'ESRS E3': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'ESRS E4': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'ESRS E5': 'bg-teal-100 text-teal-800 border-teal-200',
      'ESRS S1': 'bg-purple-100 text-purple-800 border-purple-200',
      'ESRS S2': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'ESRS S3': 'bg-violet-100 text-violet-800 border-violet-200',
      'ESRS S4': 'bg-pink-100 text-pink-800 border-pink-200',
      'ESRS G1': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[standard] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const exportDatapoints = () => {
    const allDatapoints: ESRSDatapoint[] = [];
    Object.values(hierarchy).forEach(sections => {
      Object.values(sections).forEach(datapoints => {
        allDatapoints.push(...filterDatapoints(datapoints));
      });
    });

    const csv = [
      ['Code', 'Name', 'Standard', 'Section', 'Mandatory', 'Data Type', 'Unit', 'Description'].join(','),
      ...allDatapoints.map(dp => [
        dp.code,
        `"${dp.name}"`,
        dp.standard,
        dp.section,
        dp.mandatory ? 'Yes' : 'No',
        dp.data_type,
        dp.unit || '',
        `"${dp.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'esrs-datapoints.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading ESRS datapoints...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ESRS Datapoints</h2>
          <p className="text-gray-600">Browse and explore European Sustainability Reporting Standards datapoints</p>
        </div>
        <button
          onClick={exportDatapoints}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search datapoints by name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Environment">Environment</option>
            <option value="Social">Social</option>
            <option value="Governance">Governance</option>
          </select>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showMandatoryOnly}
              onChange={(e) => setShowMandatoryOnly(e.target.checked)}
              className="mr-2"
            />
            Mandatory only
          </label>
        </div>
      </div>

      {/* Datapoint Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standards List */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(hierarchy).map(([standard, sections]) => {
            const isExpanded = expandedStandards.has(standard);
            const standardDatapoints = Object.values(sections).flat();
            const filteredCount = filterDatapoints(standardDatapoints).length;
            
            if (filteredCount === 0 && (searchQuery || selectedCategory !== 'all' || showMandatoryOnly)) {
              return null;
            }

            return (
              <div key={standard} className="bg-white rounded-lg border">
                <button
                  onClick={() => toggleStandard(standard)}
                  className={`w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg ${getStandardColor(standard)}`}
                >
                  <div className="flex items-center">
                    <Book className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{standard}</span>
                    <span className="ml-2 text-sm">({filteredCount} datapoints)</span>
                  </div>
                  <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t">
                    {Object.entries(sections).map(([section, datapoints]) => {
                      const filteredDatapoints = filterDatapoints(datapoints);
                      
                      if (filteredDatapoints.length === 0) return null;

                      return (
                        <div key={section} className="p-4 border-b last:border-b-0">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            {section}
                          </h4>
                          <div className="space-y-2">
                            {filteredDatapoints.map((datapoint) => (
                              <button
                                key={datapoint.id}
                                onClick={() => setSelectedDatapoint(datapoint)}
                                className="w-full text-left p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-200 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                                        {datapoint.code}
                                      </code>
                                      {datapoint.mandatory && (
                                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                      )}
                                    </div>
                                    <p className="font-medium text-gray-900 mt-1">{datapoint.name}</p>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {datapoint.description}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Datapoint Details */}
        <div className="lg:col-span-1">
          {selectedDatapoint ? (
            <div className="bg-white rounded-lg border p-6 sticky top-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {selectedDatapoint.code}
                    </code>
                    {selectedDatapoint.mandatory && (
                      <span className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mandatory
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedDatapoint.name}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Standard:</span>
                    <p className="text-sm text-gray-900">{selectedDatapoint.standard}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Section:</span>
                    <p className="text-sm text-gray-900">{selectedDatapoint.section}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Data Type:</span>
                    <p className="text-sm text-gray-900">{selectedDatapoint.data_type}</p>
                  </div>
                  
                  {selectedDatapoint.unit && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Unit:</span>
                      <p className="text-sm text-gray-900">{selectedDatapoint.unit}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Description:</span>
                    <p className="text-sm text-gray-900">{selectedDatapoint.description}</p>
                  </div>
                </div>

                {selectedDatapoint.ai_guidance && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">AI Guidance</h4>
                    <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {selectedDatapoint.ai_guidance}
                    </div>
                  </div>
                )}

                {selectedDatapoint.collection_questions && selectedDatapoint.collection_questions.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Collection Questions</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {selectedDatapoint.collection_questions.map((question, index) => (
                        <li key={index} className="flex">
                          <span className="text-blue-500 mr-2">•</span>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <Filter className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Select a datapoint to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ESRSDatapointBrowser;
