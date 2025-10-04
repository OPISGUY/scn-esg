import React, { useState } from 'react';
import { 
  BarChart3, 
  Calculator, 
  Recycle, 
  TrendingUp, 
  ShoppingCart, 
  FileText, 
  Menu, 
  X,
  Leaf,
  User,
  Bell,
  HelpCircle,
  Brain,
  MessageCircle,
  Shield,
  LogOut,
  Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { user, logout } = useAuth();

  // For now, use a unified navigation - role-based navigation can be added later
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, description: 'Overview of your carbon footprint and SCN impact' },
    { id: 'calculator', name: 'Carbon Calculator', icon: Calculator, description: 'Calculate your GHG Protocol compliant footprint' },
    { id: 'history', name: 'Footprint History', icon: TrendingUp, description: 'View and manage saved carbon footprints' },
    { id: 'conversational', name: 'Smart Data Entry', icon: MessageCircle, description: 'AI-powered conversational data entry' },
    { id: 'import', name: 'Import Data', icon: Upload, description: 'Import existing sustainability data from CSV, Excel, or JSON files' },
    { id: 'ewaste', name: 'E-waste Tracker', icon: Recycle, description: 'Log device donations and track environmental impact' },
    { id: 'impact', name: 'Impact Viewer', icon: TrendingUp, description: 'Visualize your environmental and social impact' },
    { id: 'offsets', name: 'Carbon Offsets', icon: ShoppingCart, description: 'Purchase verified carbon credits and Sequoia Tonnes' },
    { id: 'compliance', name: 'CSRD Compliance', icon: Shield, description: 'Corporate Sustainability Reporting Directive compliance' },
    { id: 'ai-insights', name: 'AI Insights', icon: Brain, description: 'AI-powered validation, benchmarking, and recommendations' },
    { id: 'reports', name: 'Reports', icon: FileText, description: 'Generate professional sustainability reports' },
  ];

  const getStepNumber = (viewId: string) => {
    const stepMap: { [key: string]: number } = {
      'calculator': 1,
      'ewaste': 2,
      'offsets': 2,
      'reports': 3
    };
    return stepMap[viewId] || null;
  };

  const getStepLabel = (step: number) => {
    const labels = {
      1: 'Measure',
      2: 'Act',
      3: 'Report'
    };
    return labels[step as keyof typeof labels];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SCN Platform</h1>
                  <p className="text-xs text-gray-500">Sustainable Compute Network</p>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const stepNumber = getStepNumber(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 relative group ${
                      currentView === item.id
                        ? 'bg-green-100 text-green-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={item.description}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {stepNumber && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {stepNumber}
                      </div>
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.description}
                      {stepNumber && (
                        <div className="text-blue-300 mt-1">Step {stepNumber}: {getStepLabel(stepNumber)}</div>
                      )}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowHelp(!showHelp)}
                title="Help & Guidance"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{user?.company || user?.email}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="absolute top-16 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            <h3 className="font-semibold text-gray-900 mb-3">Your Sustainability Journey</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">1</div>
                <div>
                  <div className="font-medium text-gray-900">Measure</div>
                  <div className="text-sm text-gray-600">Calculate your carbon footprint using our GHG Protocol compliant calculator</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                <div>
                  <div className="font-medium text-gray-900">Act</div>
                  <div className="text-sm text-gray-600">Donate e-waste and purchase carbon offsets to reduce your net emissions</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">3</div>
                <div>
                  <div className="font-medium text-gray-900">Report</div>
                  <div className="text-sm text-gray-600">Generate professional reports for stakeholders and compliance</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200"
            >
              Got it!
            </button>
          </div>
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const stepNumber = getStepNumber(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                      currentView === item.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {stepNumber && (
                      <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {stepNumber}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">SCN Platform</span>
              </div>
              <p className="text-sm text-gray-600">
                Empowering businesses to achieve carbon neutrality through verified offsets and digital inclusion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Platform Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>GHG Protocol Compliant Calculator</li>
                <li>Verified Carbon Offsets</li>
                <li>E-waste Impact Tracking</li>
                <li>Professional ESG Reports</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Help Documentation</li>
                <li>Contact Support</li>
                <li>API Documentation</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2024 Sustainable Compute Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;