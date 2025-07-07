import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Recycle, 
  ShoppingCart, 
  FileText, 
  ArrowRight,
  Target,
  AlertCircle,
  CheckCircle2,
  Leaf,
  GraduationCap,
  Scale,
  Info,
  HelpCircle,
  Zap
} from 'lucide-react';
import { calculateCarbonBalance, calculateStudentsSupported, getRealTimeImpactMetrics } from '../data/mockData';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const [carbonBalance, setCarbonBalance] = useState(calculateCarbonBalance());
  const [impactMetrics, setImpactMetrics] = useState(getRealTimeImpactMetrics());
  const [studentData, setStudentData] = useState(calculateStudentsSupported());
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Auto-offset function to add all remaining emissions to cart
  const handleAutoOffset = () => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('carbonCart') || '[]');
    
    // Add auto-offset to cart
    existingCart.push({
      id: `auto-offset-${Date.now()}`,
      name: `Auto-Offset: Complete Neutrality Package`,
      description: `Automatically calculated offset for your remaining ${remainingEmissions.toFixed(1)} tonnes of emissions`,
      quantity: remainingEmissions,
      price: 25, // Average price per tonne
      total: offsetCost,
      type: 'auto-offset',
      verified: true,
      sequestrationPeriod: 'Mixed portfolio (25-100 years)',
      addedAt: new Date().toISOString()
    });
    
    // Save updated cart
    localStorage.setItem('carbonCart', JSON.stringify(existingCart));
    
    // Navigate to offsets page
    onViewChange('offsets');
  };

  // Real-time updates when data changes
  useEffect(() => {
    const updateData = () => {
      setCarbonBalance(calculateCarbonBalance());
      setImpactMetrics(getRealTimeImpactMetrics());
      setStudentData(calculateStudentsSupported());
    };

    // Listen for storage changes (when offsets are purchased)
    window.addEventListener('storage', updateData);
    
    // Update every 5 seconds to catch any changes
    const interval = setInterval(updateData, 5000);

    return () => {
      window.removeEventListener('storage', updateData);
      clearInterval(interval);
    };
  }, []);

  const remainingEmissions = carbonBalance.netEmissions;
  const offsetCost = remainingEmissions * 25; // £25 per tonne average

  // Unified Dashboard - no role switching needed
  return (
    <div className="space-y-8">
      {/* Main Carbon Balance Overview */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">SCN ESG Platform Dashboard</h1>
          <p className="text-lg text-slate-200 mb-6">
            Track your carbon footprint and environmental impact
          </p>
          
          {/* Carbon Balance Visual */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Scale className="w-6 h-6 mr-2" />
              Your Carbon Balance (Real-time)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-red-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-300">{carbonBalance.grossEmissions.toFixed(1)}t</div>
                <div className="text-sm text-red-200">Gross Emissions</div>
              </div>
              <div className="flex items-center justify-center text-white text-2xl font-bold">-</div>
              <div className="bg-green-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-300">{carbonBalance.scnOffsets.toFixed(1)}t</div>
                <div className="text-sm text-green-200">SCN Offsets</div>
              </div>
              <div className="flex items-center justify-center text-white text-2xl font-bold">=</div>
            </div>
            <div className="mt-4 text-center">
              <div className={`text-4xl font-bold mb-2 ${remainingEmissions > 0 ? 'text-orange-300' : 'text-green-300'}`}>
                {remainingEmissions.toFixed(1)}t
              </div>
              <div className="text-lg text-slate-200">
                Net Emissions {remainingEmissions === 0 ? '(Carbon Neutral!)' : '(Remaining Liability)'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-green-300">{carbonBalance.neutralityPercentage.toFixed(0)}%</div>
              <div className="text-sm text-slate-300">Carbon Neutral</div>
              <div className="text-xs text-slate-400">Progress achieved</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-300">£{offsetCost.toLocaleString()}</div>
              <div className="text-sm text-slate-300">To Neutrality</div>
              <div className="text-xs text-slate-400">Investment required</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 group relative">
              <div className="text-2xl font-bold text-purple-300 flex items-center">
                {studentData.studentsSupported}
                <button
                  className="ml-2 text-purple-200 hover:text-white"
                  onMouseEnter={() => setShowTooltip('students')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-slate-300">Students Supported</div>
              <div className="text-xs text-slate-400">Through your partnership</div>
              
              {showTooltip === 'students' && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 w-64">
                  <div className="font-semibold mb-2">Students Supported Calculation:</div>
                  <div className="space-y-1">
                    <div>Hardware value: £{studentData.hardwareValue.toLocaleString()}</div>
                    <div>Offset investment: £{studentData.offsetSpend.toLocaleString()}</div>
                    <div>Total investment: £{studentData.totalInvestment.toLocaleString()}</div>
                    <div className="border-t border-gray-600 pt-1 mt-1">
                      <div>Students: {studentData.studentsSupported} (£{studentData.costPerStudent}/student)</div>
                    </div>
                  </div>
                </div>              )}
            </div>
          </div>
        </div>
      </div>

      {/* SCN Impact Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Recycle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{impactMetrics.eWasteDiverted}kg</div>
              <div className="text-sm text-gray-600">E-Waste Diverted</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Prevented from landfill</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{impactMetrics.carbonCreditsFromDonations.toFixed(1)}t</div>
              <div className="text-sm text-gray-600">Credits Generated</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">From your donations</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{impactMetrics.sequoiaTonnesPurchased}</div>
              <div className="text-sm text-gray-600">Sequoia Tonnes</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Direct sequestration</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{studentData.studentsSupported}</div>
              <div className="text-sm text-gray-600">Students Supported</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Digital skills training</div>
        </div>
      </div>

      {/* Action Required Section */}
      {remainingEmissions > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200">
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
            <AlertCircle className="w-6 h-6 mr-2" />
            Action Required: Complete Your Carbon Neutrality Journey
          </h3>
          <p className="text-orange-800 mb-4">
            You have {remainingEmissions.toFixed(1)} tonnes of net emissions remaining. 
            Complete your sustainability commitment with SCN's certified offset programs.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-orange-700">
              <strong>Investment needed:</strong> £{offsetCost.toLocaleString()} 
              <span className="text-orange-600 ml-2">({remainingEmissions.toFixed(1)}t × £25-35/t)</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAutoOffset}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Auto-Offset Now</span>
              </button>
              <button
                onClick={() => onViewChange('offsets')}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onViewChange('calculator')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Update Your Footprint Data</h3>
          <p className="text-sm text-gray-600 mb-4">Ensure your carbon footprint calculation reflects the latest data</p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <span>Update footprint</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </button>

        {remainingEmissions > 0 && (
          <button
            onClick={handleAutoOffset}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Auto-Offset Remaining Emissions</h3>
            <p className="text-sm text-gray-600 mb-4">Instantly add {remainingEmissions.toFixed(1)}t of credits to your cart for £{offsetCost.toLocaleString()}</p>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <span>Add to cart automatically</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </button>
        )}

        <button
          onClick={() => onViewChange('offsets')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors duration-200">
            <ShoppingCart className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Visit Offset Marketplace</h3>
          <p className="text-sm text-gray-600 mb-4">Browse carbon credits and Sequoia Tonnes to complete neutrality</p>
          <div className="flex items-center text-purple-600 text-sm font-medium">
            <span>Browse marketplace</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </button>
      </div>

      {/* Guided Journey Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Your Sustainability Journey
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-medium text-green-900">1. Measure</div>
              <div className="text-sm text-green-700">Calculate your footprint</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-100 rounded-lg">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
            <div>
              <div className="font-medium text-yellow-900">2. Act</div>
              <div className="text-sm text-yellow-700">Donate & offset emissions</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
            <div>
              <div className="font-medium text-gray-900">3. Report</div>
              <div className="text-sm text-gray-700">Generate impact reports</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => onViewChange('calculator')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Update Carbon Footprint</h3>
          <p className="text-sm text-gray-600 mb-4">Input latest energy bills and fuel usage data</p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <span>Enter data now</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </button>

        <button
          onClick={() => onViewChange('ewaste')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
            <Recycle className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Log E-waste Donation</h3>
          <p className="text-sm text-gray-600 mb-4">Record your latest device donations to SCN</p>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            <span>Add donation</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </button>

        <button
          onClick={() => onViewChange('reports')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors duration-200">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Generate ESG Report</h3>
          <p className="text-sm text-gray-600 mb-4">Create detailed sustainability reports</p>
          <div className="flex items-center text-purple-600 text-sm font-medium">
            <span>Generate now</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;