import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CarbonCalculator from './components/CarbonCalculator';
import EwasteTracker from './components/EwasteTracker';
import ImpactViewer from './components/ImpactViewer';
import CarbonOffsets from './components/CarbonOffsets';
import Reports from './components/Reports';
import AIInsights from './components/AIInsights';
import ConversationalDataEntry from './components/ConversationalDataEntry';
import CSRDCompliance from './components/CSRDCompliance';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'decision_maker'>('admin');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} userRole={userRole} />;
      case 'calculator':
        return <CarbonCalculator onViewChange={setCurrentView} />;
      case 'ewaste':
        return <EwasteTracker />;
      case 'impact':
        return <ImpactViewer />;
      case 'offsets':
        return <CarbonOffsets />;
      case 'reports':
        return <Reports />;
      case 'ai-insights':
        return <AIInsights />;
      case 'conversational':
        return <ConversationalDataEntry onDataExtracted={(data) => console.log('Extracted data:', data)} />;
      case 'compliance':
        return <CSRDCompliance />;
      default:
        return <Dashboard onViewChange={setCurrentView} userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Switcher for Demo */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Demo: Switch User Role</div>
          <div className="flex space-x-2">
            <button
              onClick={() => setUserRole('admin')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                userRole === 'admin'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setUserRole('decision_maker')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                userRole === 'decision_maker'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Executive
            </button>
          </div>
        </div>
      </div>

      <Layout currentView={currentView} onViewChange={setCurrentView} userRole={userRole}>
        {renderCurrentView()}
      </Layout>
    </div>
  );
}

export default App;