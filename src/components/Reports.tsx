import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users, Scale, CheckCircle, AlertCircle } from 'lucide-react';
import { mockImpactMetrics, mockEwasteEntries, calculateCarbonBalance } from '../data/mockData';
import { pdfService, ReportData } from '../services/pdfService';
import { carbonService, CarbonFootprintData } from '../services/carbonService';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState('ghg-protocol');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [footprints, setFootprints] = useState<CarbonFootprintData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carbonBalance = calculateCarbonBalance();

  // Fetch user's carbon footprints on mount
  useEffect(() => {
    const fetchFootprints = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await carbonService.getFootprints();
        setFootprints(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load footprints:', err);
        setError('Failed to load carbon footprint data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFootprints();
  }, [user]);

  // Get the most recent footprint or fallback to localStorage or defaults
  const getCurrentFootprint = () => {
    if (footprints.length > 0) {
      const latest = footprints[0];
      return {
        companyName: user?.companyName || user?.email?.split('@')[0] || 'Your Company',
        scope1: latest.scope1_emissions,
        scope2: latest.scope2_emissions,
        scope3: latest.scope3_emissions,
        total: latest.total_emissions || (latest.scope1_emissions + latest.scope2_emissions + latest.scope3_emissions)
      };
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('carbonFootprint');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return {
          companyName: data.companyName || user?.companyName || 'Your Company',
          scope1: data.scope1 || 0,
          scope2: data.scope2 || 0,
          scope3: data.scope3 || 0,
          total: data.total || 0
        };
      } catch {
        // ignore parse errors
      }
    }

    // Final fallback to zeros
    return {
      companyName: user?.company_data?.name || user?.email?.split('@')[0] || 'Your Company',
      scope1: 0,
      scope2: 0,
      scope3: 0,
      total: 0
    };
  };

  const currentFootprint = getCurrentFootprint();

  const generatePDFReport = async () => {
    setIsGenerating(true);
    try {
      const reportData: ReportData = {
        companyName: currentFootprint.companyName,
        reportingPeriod: { start: startDate, end: endDate },
        carbonFootprint: currentFootprint,
        carbonBalance: carbonBalance,
        impactMetrics: mockImpactMetrics,
        ewasteEntries: mockEwasteEntries,
        generatedAt: new Date().toISOString()
      };

      await pdfService.generateReport(reportData);
      setLastGenerated(new Date().toISOString());
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypes = [
    {
      id: 'ghg-protocol',
      name: 'GHG Protocol ESG Report',
      description: 'Comprehensive GHG Protocol compliant ESG report with carbon balance sheet and SCN impact metrics',
      icon: BarChart3,
      color: 'green',
      compliance: 'GHG Protocol Corporate Standard'
    },
    {
      id: 'carbon-balance',
      name: 'Carbon Balance Sheet',
      description: 'Detailed breakdown of gross emissions, SCN offsets applied, and net carbon position',
      icon: Scale,
      color: 'orange',
      compliance: 'GHG Protocol + SCN Methodology'
    },
    {
      id: 'esg-executive',
      name: 'ESG Executive Summary',
      description: 'Executive summary of environmental, social, and governance performance for board presentations',
      icon: TrendingUp,
      color: 'blue',
      compliance: 'TCFD Aligned'
    },
    {
      id: 'scn-impact',
      name: 'SCN Partnership Impact',
      description: 'Comprehensive analysis of social and environmental impact through SCN collaboration',
      icon: Users,
      color: 'purple',
      compliance: 'Social Value Act 2012'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-600 border-green-200',
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">ESG Reporting Engine</h1>
            <p className="text-slate-200">Generate professional, compliant ESG reports for stakeholders</p>
          </div>
          <FileText className="w-16 h-16 text-green-400" />
        </div>
      </div>

      {/* Loading/Error States */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-800">Loading your carbon footprint data...</span>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-amber-800 font-medium">{error}</p>
            <p className="text-amber-700 text-sm mt-1">Using local data for report generation</p>
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800">Please log in to access your carbon footprint reports and data.</p>
        </div>
      )}

      {/* Report Generation Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Download className="w-6 h-6 mr-2 text-green-600" />
          Generate Professional Report
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Report Configuration */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select 
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {reportTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <button
              onClick={generatePDFReport}
              disabled={isGenerating}
              className={`w-full px-6 py-4 rounded-lg font-medium text-white transition-all ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Report...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Generate PDF Report
                </div>
              )}
            </button>

            {lastGenerated && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Last generated: {new Date(lastGenerated).toLocaleString()}
              </div>
            )}
          </div>

          {/* Report Preview */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
            {selectedReport && (
              <div className="space-y-4">
                {reportTypes.find(type => type.id === selectedReport) && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getColorClasses(reportTypes.find(type => type.id === selectedReport)?.color || 'green')}`}>
                        {(() => {
                          const selectedType = reportTypes.find(type => type.id === selectedReport);
                          const IconComponent = selectedType?.icon;
                          return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
                        })()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {reportTypes.find(type => type.id === selectedReport)?.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {reportTypes.find(type => type.id === selectedReport)?.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-2">
                          Compliance: {reportTypes.find(type => type.id === selectedReport)?.compliance}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Company:</span>
                    <span className="font-medium">{currentFootprint.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Period:</span>
                    <span className="font-medium">{startDate} to {endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Emissions:</span>
                    <span className="font-medium">{currentFootprint.total.toFixed(1)} tCO₂e</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Emissions:</span>
                    <span className="font-medium">{carbonBalance.netEmissions.toFixed(1)} tCO₂e</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbon Neutrality:</span>
                    <span className="font-medium">{carbonBalance.neutralityPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map(report => (
            <div 
              key={report.id}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedReport === report.id 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${getColorClasses(report.color)}`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  <div className="mt-3">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {report.compliance}
                    </span>
                  </div>
                </div>
                {selectedReport === report.id && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Data Summary */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Data Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Carbon Footprint</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {currentFootprint.total.toFixed(1)} tCO₂e
            </div>
            <div className="text-sm text-green-700">
              Scope 1: {currentFootprint.scope1.toFixed(1)} • 
              Scope 2: {currentFootprint.scope2.toFixed(1)} • 
              Scope 3: {currentFootprint.scope3.toFixed(1)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">SCN Impact</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {mockImpactMetrics.eWasteDiverted} kg
            </div>
            <div className="text-sm text-blue-700">
              E-waste diverted • {mockImpactMetrics.studentsSupported} students supported
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Net Position</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {carbonBalance.neutralityPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-700">
              Carbon neutrality progress
            </div>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reports</h2>
        
        <div className="space-y-4">
          {[
            { 
              name: 'GHG Protocol ESG Report 2024', 
              date: '2024-06-15', 
              type: 'GHG Protocol', 
              size: '2.4 MB', 
              compliance: 'GHG Protocol Corporate Standard' 
            },
            { 
              name: 'Carbon Balance Sheet Q4 2024', 
              date: '2024-06-10', 
              type: 'Carbon Balance', 
              size: '1.8 MB', 
              compliance: 'GHG Protocol + SCN' 
            },
            { 
              name: 'SCN Partnership Impact Report 2024', 
              date: '2024-05-20', 
              type: 'SCN Impact', 
              size: '3.1 MB', 
              compliance: 'Social Value Act 2012' 
            },
            { 
              name: 'ESG Executive Summary 2023', 
              date: '2023-12-15', 
              type: 'ESG Executive', 
              size: '1.2 MB', 
              compliance: 'TCFD Aligned' 
            }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">{report.compliance}</span>
                  </div>
                </div>
              </div>
              
              <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;