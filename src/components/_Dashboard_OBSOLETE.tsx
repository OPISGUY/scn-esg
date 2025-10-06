import React, { useState } from 'react';
import { 
  TrendingUp, 
  Recycle, 
  ShoppingCart, 
  FileText, 
  ArrowRight,
  Target,
  Leaf,
  GraduationCap,
  Scale,
  Info,
  HelpCircle,
  Zap,
  Upload,
  Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [showDemoMode, setShowDemoMode] = useState(false);

  // Check if this is the demo user account
  const isDemoUser = user?.email === 'business@scn.com';
  
  // Check if user has any real data (TODO: implement backend check)
  const hasRealData = false;

  // Show demo dashboard for demo user or if demo mode is enabled
  if (isDemoUser || showDemoMode) {
    return <FullDashboard onViewChange={onViewChange} isDemoMode={true} />;
  }

  // Show empty state for new users without data
  if (!hasRealData) {
    return <EmptyStateDashboard onViewChange={onViewChange} onShowDemo={() => setShowDemoMode(true)} />;
  }

  // Show full dashboard for users with real data
  return <FullDashboard onViewChange={onViewChange} isDemoMode={false} />;
};

const EmptyStateDashboard: React.FC<{
  onViewChange: (view: string) => void;
  onShowDemo: () => void;
}> = ({ onViewChange, onShowDemo }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Verdant By SCN, {user?.first_name}!
          </h1>
          <p className="text-lg text-green-100 mb-6">
            You're all set! Let's start tracking your organization's environmental impact and sustainability journey.
          </p>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-green-100 mb-4">
              Choose how you'd like to begin your sustainability tracking:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => onViewChange('calculator')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-center">
                  <Zap className="w-6 h-6 mr-3 text-yellow-300" />
                  <div>
                    <div className="font-semibold">Calculate Carbon Footprint</div>
                    <div className="text-sm text-green-100">Start tracking your emissions</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => onViewChange('conversational')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-center">
                  <HelpCircle className="w-6 h-6 mr-3 text-blue-300" />
                  <div>
                    <div className="font-semibold">AI-Guided Setup</div>
                    <div className="text-sm text-green-100">Let AI help you get started</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Track Emissions"
          description="Start calculating your carbon footprint"
          onClick={() => onViewChange('calculator')}
          color="bg-blue-500"
        />
        
        <ActionCard
          icon={<Recycle className="w-8 h-8" />}
          title="Log E-Waste"
          description="Record electronic waste donations"
          onClick={() => onViewChange('ewaste')}
          color="bg-green-500"
        />
        
        <ActionCard
          icon={<ShoppingCart className="w-8 h-8" />}
          title="Buy Offsets"
          description="Purchase verified carbon credits"
          onClick={() => onViewChange('offsets')}
          color="bg-purple-500"
        />
        
        <ActionCard
          icon={<FileText className="w-8 h-8" />}
          title="CSRD Compliance"
          description="Explore reporting requirements"
          onClick={() => onViewChange('compliance')}
          color="bg-indigo-500"
        />
      </div>

      {/* Data Import Options */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="w-6 h-6 mr-2 text-gray-600" />
          Import Your Data
        </h3>
        <p className="text-gray-600 mb-6">
          Have existing sustainability data? Import it to get started faster.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="font-medium">CSV/Excel Files</div>
              <div className="text-sm text-gray-500">Import emissions data</div>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="font-medium">Connect APIs</div>
              <div className="text-sm text-gray-500">Link energy systems</div>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="font-medium">Set Targets</div>
              <div className="text-sm text-gray-500">Define ESG goals</div>
            </div>
          </button>
        </div>
      </div>

      {/* Demo Mode Option */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-start">
          <Info className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Explore with Demo Data</h3>
            <p className="text-gray-600 mb-4">
              Want to see what the platform looks like with data? Try our demo mode to explore all features with sample data.
            </p>
            <button
              onClick={onShowDemo}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              View Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}> = ({ icon, title, description, onClick, color }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
  >
    <div className={`${color} text-white rounded-lg p-3 w-fit mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <div className="flex items-center text-green-600 text-sm font-medium">
      Get Started
      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

// Import the original dashboard component for demo mode
const FullDashboard: React.FC<DashboardProps & { isDemoMode: boolean }> = ({ onViewChange, isDemoMode }) => {
  const { user } = useAuth();
  
  // This is the original dashboard implementation with mock data
  const [carbonBalance] = useState({
    grossEmissions: 150.5,
    offsetsPurchased: 45.2,
    ewasteCredits: 12.8,
    netEmissions: 92.5
  });
  
  const [impactMetrics] = useState({
    totalCO2Saved: 158.3,
    devicesRecycled: 47,
    studentsSupported: 23,
    offsetsPurchased: 45.2
  });

  const remainingEmissions = Math.max(0, carbonBalance.grossEmissions - carbonBalance.offsetsPurchased - carbonBalance.ewasteCredits);
  const offsetCost = remainingEmissions * 25;

  const handleAutoOffset = () => {
    const existingCart = JSON.parse(localStorage.getItem('carbonCart') || '[]');
    
    existingCart.push({
      id: `auto-offset-${Date.now()}`,
      name: `Auto-Offset: Complete Neutrality Package`,
      description: `Automatically calculated offset for your remaining ${remainingEmissions.toFixed(1)} tonnes of emissions`,
      quantity: remainingEmissions,
      price: 25,
      total: offsetCost,
      type: 'auto-offset',
      verified: true,
      sequestrationPeriod: 'Mixed portfolio (25-100 years)',
      addedAt: new Date().toISOString()
    });
    
    localStorage.setItem('carbonCart', JSON.stringify(existingCart));
    onViewChange('offsets');
  };

  return (
    <div className="space-y-8">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              {user?.email === 'business@scn.com' ? 'Demo Account' : 'Demo Mode'}
            </span>
            <span className="text-blue-600 ml-2">
              {user?.email === 'business@scn.com' 
                ? '- Welcome to the Verdant By SCN demo' 
                : '- This data is for demonstration purposes'}
            </span>
          </div>
        </div>
      )}

      {/* Main Carbon Balance Overview */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Verdant By SCN Dashboard</h1>
          <p className="text-lg text-slate-200 mb-6">
            Track your carbon footprint and environmental impact
          </p>
          
          {/* Carbon Balance Visual */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Scale className="w-6 h-6 mr-2" />
              Your Carbon Balance (Demo Data)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-red-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-300">{carbonBalance.grossEmissions.toFixed(1)}t</div>
                <div className="text-sm text-red-200">Gross Emissions</div>
              </div>
              <div className="bg-green-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-300">{carbonBalance.offsetsPurchased.toFixed(1)}t</div>
                <div className="text-sm text-green-200">Offsets Purchased</div>
              </div>
              <div className="bg-blue-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-300">{carbonBalance.ewasteCredits.toFixed(1)}t</div>
                <div className="text-sm text-blue-200">E-waste Credits</div>
              </div>
              <div className="bg-orange-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-300">{carbonBalance.netEmissions.toFixed(1)}t</div>
                <div className="text-sm text-orange-200">Net Emissions</div>
              </div>
            </div>
          </div>

          {/* Auto-Offset CTA */}
          {remainingEmissions > 0 && (
            <div className="bg-green-600 bg-opacity-20 backdrop-blur-sm rounded-xl p-6 border border-green-400 border-opacity-30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Leaf className="w-8 h-8 text-green-400 mr-4" />
                  <div>
                    <h3 className="text-xl font-bold text-green-300">Achieve Carbon Neutrality</h3>
                    <p className="text-green-200">
                      Offset your remaining {remainingEmissions.toFixed(1)} tonnes for ${offsetCost.toFixed(0)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAutoOffset}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Auto-Offset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Calculate Emissions"
          description="Add new carbon footprint data"
          onClick={() => onViewChange('calculator')}
          color="bg-blue-500"
        />
        
        <ActionCard
          icon={<Recycle className="w-8 h-8" />}
          title="Log E-Waste"
          description="Record electronic waste donations"
          onClick={() => onViewChange('ewaste')}
          color="bg-green-500"
        />
        
        <ActionCard
          icon={<ShoppingCart className="w-8 h-8" />}
          title="Buy Offsets"
          description="Purchase verified carbon credits"
          onClick={() => onViewChange('offsets')}
          color="bg-purple-500"
        />
        
        <ActionCard
          icon={<FileText className="w-8 h-8" />}
          title="Generate Reports"
          description="Create sustainability reports"
          onClick={() => onViewChange('reports')}
          color="bg-indigo-500"
        />
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-lg p-3">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">↗ +12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{impactMetrics.totalCO2Saved.toFixed(1)}t</h3>
          <p className="text-gray-600">CO₂ Saved</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <Recycle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">↗ +8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{impactMetrics.devicesRecycled}</h3>
          <p className="text-gray-600">Devices Recycled</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">↗ +15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{impactMetrics.studentsSupported}</h3>
          <p className="text-gray-600">Students Supported</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 rounded-lg p-3">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">↗ +5%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{impactMetrics.offsetsPurchased.toFixed(1)}t</h3>
          <p className="text-gray-600">Offsets Purchased</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
