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
  Zap,
  Plus,
  Upload,
  Play,
  BarChart3,
  Users,
  Building,
  Brain,
  Shield,
  Calendar,
  Globe,
  Award,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { calculateCarbonBalance, getRealTimeImpactMetrics } from '../data/mockData';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [showDemoMode, setShowDemoMode] = useState(false);

  // Check if user is the demo user or has real data
  const isDemoUser = user?.email === 'demo@scn.com';
  const hasRealData = isDemoUser; // Demo user always has data, others need to add data

  if (!hasRealData && !showDemoMode) {
    return <EmptyStateDashboard onViewChange={onViewChange} onShowDemo={() => setShowDemoMode(true)} />;
  }

  // Show full dashboard with data
  return <FullDashboard onViewChange={onViewChange} isDemoMode={isDemoUser || showDemoMode} />;
};

const EmptyStateDashboard: React.FC<{
  onViewChange: (view: string) => void;
  onShowDemo: () => void;
}> = ({ onViewChange, onShowDemo }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Hero Section - Glassmorphic */}
        <div className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-600/10"></div>
          <div className="relative p-12">
            <div className="max-w-4xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-6 shadow-lg">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Welcome to SCN ESG Platform
                  </h1>
                  <p className="text-xl text-gray-600 mt-2">
                    Hi {user?.first_name}! Ready to start your sustainability journey?
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Transform your organization's environmental impact with our comprehensive ESG platform. 
                Track emissions, manage e-waste, purchase verified offsets, and ensure CSRD compliance.
              </p>
              
              {/* Quick Start Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => onViewChange('calculator')}
                  className="group relative overflow-hidden rounded-2xl bg-white/30 backdrop-blur-md border border-white/50 p-6 text-left transition-all duration-300 hover:bg-white/40 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Start Tracking Emissions</h3>
                      <p className="text-sm text-gray-600">Calculate your carbon footprint</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
                
                <button
                  onClick={() => onViewChange('conversational')}
                  className="group relative overflow-hidden rounded-2xl bg-white/30 backdrop-blur-md border border-white/50 p-6 text-left transition-all duration-300 hover:bg-white/40 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">AI-Guided Setup</h3>
                      <p className="text-sm text-gray-600">Let AI help you get started</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid - Glassmorphic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Carbon Tracking"
            description="Monitor and reduce emissions across all operations"
            onClick={() => onViewChange('calculator')}
            gradient="from-blue-500 to-blue-600"
            metrics={[
              { label: "Scope 1, 2 & 3", value: "Complete Coverage" },
              { label: "Real-time", value: "Live Monitoring" }
            ]}
          />
          
          <FeatureCard
            icon={<Recycle className="w-8 h-8" />}
            title="E-Waste Management"
            description="Transform electronic waste into carbon credits"
            onClick={() => onViewChange('ewaste')}
            gradient="from-green-500 to-emerald-600"
            metrics={[
              { label: "Impact Tracking", value: "CO₂ Savings" },
              { label: "Certification", value: "Verified Credits" }
            ]}
          />
          
          <FeatureCard
            icon={<ShoppingCart className="w-8 h-8" />}
            title="Carbon Offsets"
            description="Purchase verified credits from premium projects"
            onClick={() => onViewChange('offsets')}
            gradient="from-purple-500 to-purple-600"
            metrics={[
              { label: "Verified", value: "Gold Standard" },
              { label: "Permanent", value: "Long-term Storage" }
            ]}
          />
          
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="CSRD Compliance"
            description="Ensure compliance with EU sustainability reporting"
            onClick={() => onViewChange('compliance')}
            gradient="from-indigo-500 to-indigo-600"
            metrics={[
              { label: "ESRS", value: "All Standards" },
              { label: "Automated", value: "Report Generation" }
            ]}
          />
        </div>

        {/* Data Import Section */}
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Your Data</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have existing sustainability data? Import it to get started faster and see immediate insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImportOption
              icon={<FileText className="w-8 h-8" />}
              title="CSV/Excel Files"
              description="Import emissions and operational data"
              formats="CSV, XLSX, JSON"
            />
            
            <ImportOption
              icon={<Zap className="w-8 h-8" />}
              title="Energy Systems"
              description="Connect smart meters and IoT devices"
              formats="API, MQTT, REST"
            />
            
            <ImportOption
              icon={<Building className="w-8 h-8" />}
              title="ERP Integration"
              description="Sync with existing business systems"
              formats="SAP, Oracle, Custom"
            />
          </div>
        </div>

        {/* AI Insights Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mr-4 shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
                <p className="text-gray-600">Get intelligent recommendations</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40">
                <Target className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-gray-700">Set science-based targets</span>
              </div>
              <div className="flex items-center p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40">
                <TrendingDown className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-gray-700">Identify reduction opportunities</span>
              </div>
              <div className="flex items-center p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40">
                <Award className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-gray-700">Benchmark against peers</span>
              </div>
            </div>
            
            <button
              onClick={() => onViewChange('ai-insights')}
              className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl py-3 font-semibold transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              Explore AI Features
            </button>
          </div>

          <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center mr-4 shadow-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Explore Demo Mode</h3>
                <p className="text-gray-600">See the platform in action</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              Want to see what the platform looks like with data? Try our interactive demo 
              to explore all features with realistic sample data.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                Sample carbon footprint data
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                E-waste tracking examples
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                CSRD compliance reports
              </div>
            </div>
            
            <button
              onClick={onShowDemo}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl py-3 font-semibold transition-all hover:shadow-lg hover:scale-[1.02] flex items-center justify-center"
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

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
  metrics: { label: string; value: string }[];
}> = ({ icon, title, description, onClick, gradient, metrics }) => (
  <div
    onClick={onClick}
    className="group relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/30 hover:scale-[1.02] hover:shadow-2xl"
  >
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform text-white`}>
      {icon}
    </div>
    
    <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
    
    <div className="space-y-2 mb-4">
      {metrics.map((metric, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-gray-500">{metric.label}</span>
          <span className="font-medium text-gray-700">{metric.value}</span>
        </div>
      ))}
    </div>
    
    <div className="flex items-center text-blue-600 text-sm font-medium">
      Get Started
      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

const ImportOption: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  formats: string;
}> = ({ icon, title, description, formats }) => (
  <button className="group p-6 rounded-2xl bg-white/30 backdrop-blur-md border border-white/50 hover:bg-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg text-left">
    <div className="w-12 h-12 rounded-xl bg-white/40 backdrop-blur-sm flex items-center justify-center mb-4 text-gray-700 group-hover:text-blue-600 transition-colors">
      {icon}
    </div>
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{description}</p>
    <div className="text-xs text-gray-500 font-medium">{formats}</div>
  </button>
);

// Full Dashboard with Data
const FullDashboard: React.FC<DashboardProps & { isDemoMode: boolean }> = ({ onViewChange, isDemoMode }) => {
  const { user } = useAuth();
  const [carbonBalance] = useState(calculateCarbonBalance());
  const [impactMetrics] = useState(getRealTimeImpactMetrics());

  const remainingEmissions = Math.max(0, carbonBalance.grossEmissions - carbonBalance.scnOffsets, 0);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="rounded-2xl bg-blue-500/10 backdrop-blur-sm border border-blue-200/50 p-4">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                {user?.email === 'business@scn.com' ? 'Demo Account' : 'Demo Mode'}
              </span>
              <span className="text-blue-600 ml-2">
                - {user?.email === 'business@scn.com' ? 'This is a demonstration account with sample data' : 'Exploring with sample data'}
              </span>
            </div>
          </div>
        )}

        {/* Main Carbon Balance Hero - Glassmorphic */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative p-12 text-white">
            <div className="max-w-5xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mr-6 border border-white/20">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">ESG Dashboard</h1>
                  <p className="text-xl text-slate-200">
                    Real-time carbon balance and environmental impact
                  </p>
                </div>
              </div>
              
              {/* Carbon Balance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center">
                  <div className="text-3xl font-bold text-red-300 mb-2">{carbonBalance.grossEmissions.toFixed(1)}t</div>
                  <div className="text-sm text-red-200">Gross Emissions</div>
                  <div className="w-full bg-red-500/20 rounded-full h-2 mt-3">
                    <div className="bg-red-400 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center">
                  <div className="text-3xl font-bold text-green-300 mb-2">{carbonBalance.scnOffsets.toFixed(1)}t</div>
                  <div className="text-sm text-green-200">SCN Offsets</div>
                  <div className="w-full bg-green-500/20 rounded-full h-2 mt-3">
                    <div className="bg-green-400 h-2 rounded-full" style={{width: `${(carbonBalance.scnOffsets / carbonBalance.grossEmissions) * 100}%`}}></div>
                  </div>
                </div>
                
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-2">{carbonBalance.neutralityPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-blue-200">Carbon Neutral</div>
                  <div className="w-full bg-blue-500/20 rounded-full h-2 mt-3">
                    <div className="bg-blue-400 h-2 rounded-full" style={{width: `${carbonBalance.neutralityPercentage}%`}}></div>
                  </div>
                </div>
                
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center">
                  <div className="text-3xl font-bold text-orange-300 mb-2">{carbonBalance.netEmissions.toFixed(1)}t</div>
                  <div className="text-sm text-orange-200">Net Emissions</div>
                  <div className="w-full bg-orange-500/20 rounded-full h-2 mt-3">
                    <div className="bg-orange-400 h-2 rounded-full" style={{width: `${(carbonBalance.netEmissions / carbonBalance.grossEmissions) * 100}%`}}></div>
                  </div>
                </div>
              </div>

              {/* Auto-Offset CTA */}
              {remainingEmissions > 0 && (
                <div className="rounded-2xl bg-green-500/20 backdrop-blur-md border border-green-400/30 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-green-500/30 backdrop-blur-sm flex items-center justify-center mr-4 border border-green-400/30">
                        <Leaf className="w-6 h-6 text-green-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-300 mb-1">Achieve Carbon Neutrality</h3>
                        <p className="text-green-200">
                          Offset your remaining {remainingEmissions.toFixed(1)} tonnes for ${offsetCost.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAutoOffset}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center shadow-lg"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Auto-Offset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Calculate Emissions"
            description="Add new carbon footprint data"
            onClick={() => onViewChange('calculator')}
            gradient="from-blue-500 to-blue-600"
            value="+15.2t"
            label="This month"
          />
          
          <ActionCard
            icon={<Recycle className="w-8 h-8" />}
            title="Log E-Waste"
            description="Record electronic waste donations"
            onClick={() => onViewChange('ewaste')}
            gradient="from-green-500 to-emerald-600"
            value="47 devices"
            label="Recycled"
          />
          
          <ActionCard
            icon={<ShoppingCart className="w-8 h-8" />}
            title="Buy Offsets"
            description="Purchase verified carbon credits"
            onClick={() => onViewChange('offsets')}
            gradient="from-purple-500 to-purple-600"
            value="$1,130"
            label="Available credits"
          />
          
          <ActionCard
            icon={<FileText className="w-8 h-8" />}
            title="Generate Reports"
            description="Create sustainability reports"
            onClick={() => onViewChange('reports')}
            gradient="from-indigo-500 to-indigo-600"
            value="CSRD Ready"
            label="Compliance"
          />
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={<Leaf className="w-6 h-6 text-green-600" />}
            title="CO₂ Saved"
            value={`${impactMetrics.totalCO2Avoided.toFixed(1)}t`}
            change="+12%"
            gradient="from-green-500 to-emerald-600"
          />

          <MetricCard
            icon={<Recycle className="w-6 h-6 text-blue-600" />}
            title="Devices Recycled"
            value={impactMetrics.devicesRecycled.toString()}
            change="+8%"
            gradient="from-blue-500 to-blue-600"
          />

          <MetricCard
            icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
            title="Students Supported"
            value={impactMetrics.studentsSupported.toString()}
            change="+15%"
            gradient="from-purple-500 to-purple-600"
          />

          <MetricCard
            icon={<Target className="w-6 h-6 text-orange-600" />}
            title="Offsets Purchased"
            value={`${impactMetrics.offsetsPurchased.toFixed(1)}t`}
            change="+5%"
            gradient="from-orange-500 to-orange-600"
          />
        </div>

        {/* AI Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mr-4 shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI Recommendations</h3>
                <p className="text-gray-600">Smart insights for your ESG strategy</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                  <span className="font-medium text-gray-900">High Impact Opportunity</span>
                </div>
                <p className="text-sm text-gray-600">Switch to renewable energy could reduce emissions by 23.4t CO₂e annually</p>
              </div>
              
              <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                  <span className="font-medium text-gray-900">Optimization Suggestion</span>
                </div>
                <p className="text-sm text-gray-600">Your e-waste program is performing 15% above industry average</p>
              </div>
            </div>
            
            <button
              onClick={() => onViewChange('ai-insights')}
              className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl py-3 font-semibold transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              View All Insights
            </button>
          </div>

          <div className="rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h3>
                <p className="text-gray-600">Stay on top of compliance</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">CSRD Report</span>
                  <span className="text-sm text-orange-600 font-medium">Due in 45 days</span>
                </div>
                <p className="text-sm text-gray-600">Annual sustainability disclosure report</p>
              </div>
              
              <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">Carbon Audit</span>
                  <span className="text-sm text-green-600 font-medium">Ready</span>
                </div>
                <p className="text-sm text-gray-600">Q4 carbon footprint verification</p>
              </div>
            </div>
            
            <button
              onClick={() => onViewChange('compliance')}
              className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl py-3 font-semibold transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              Manage Compliance
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
  gradient: string;
  value: string;
  label: string;
}> = ({ icon, title, description, onClick, gradient, value, label }) => (
  <div
    onClick={onClick}
    className="group relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/50 hover:scale-[1.02] hover:shadow-2xl"
  >
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform text-white`}>
      {icon}
    </div>
    
    <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
    
    <div className="flex justify-between items-end mb-4">
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
    
    <div className="flex items-center text-blue-600 text-sm font-medium">
      Open
      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

const MetricCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  gradient: string;
}> = ({ icon, title, value, change, gradient }) => (
  <div className="rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} bg-opacity-10 flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-green-600 text-sm font-medium bg-green-100/50 px-2 py-1 rounded-lg backdrop-blur-sm">{change}</span>
    </div>
    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-gray-600 font-medium">{title}</p>
  </div>
);

export default Dashboard;
