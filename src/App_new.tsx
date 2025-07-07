import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Onboarding from './components/Onboarding';
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

function AppContent() {
  const { isAuthenticated, user, isLoading, completeOnboarding } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage 
        onSuccess={() => {
          // Check if this is first login and show onboarding
          if (user?.isFirstLogin) {
            setShowOnboarding(true);
          }
        }} 
      />
    );
  }

  // Show onboarding for first-time users
  if (showOnboarding || user?.isFirstLogin) {
    return (
      <Onboarding 
        onComplete={() => {
          setShowOnboarding(false);
          completeOnboarding();
        }}
      />
    );
  }

  // Map user roles to component expected types
  const getUserRole = (): 'admin' | 'decision_maker' => {
    if (user?.role === 'decision_maker') return 'decision_maker';
    return 'admin'; // default for admin and sustainability_manager
  };

  const renderCurrentView = () => {
    const userRole = getUserRole();
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
      <Layout currentView={currentView} onViewChange={setCurrentView} userRole={getUserRole()}>
        {renderCurrentView()}
      </Layout>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
