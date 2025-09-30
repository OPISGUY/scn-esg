import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HelpProvider } from './contexts/HelpContext';
import AuthLayout from './components/auth/AuthLayout';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CarbonCalculator from './components/CarbonCalculator';
import EwasteTracker from './components/EwasteTracker';
import ImpactViewer from './components/ImpactViewer';
import EnhancedCarbonOffsets from './components/EnhancedCarbonOffsets';
import Reports from './components/Reports';
import AIInsights from './components/AIInsights';
import ConversationalDataEntry from './components/ConversationalDataEntry';
import CSRDCompliance from './components/CSRDCompliance';
import { FootprintHistory } from './components/FootprintHistory';
import HelpButton from './components/HelpButton';
import { HelpTooltipPortal } from './components/HelpTooltip';

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Debug logging
  console.log('🔍 APP DEBUG - User state:', {
    isAuthenticated,
    user: user ? {
      email: user.email,
      is_onboarding_complete: user.is_onboarding_complete,
      isDemoUser: user.email === 'demo@scn.com'
    } : null,
    isLoading
  });

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
    return <AuthLayout />;
  }

  // Show onboarding for users who haven't completed it (except demo user)
  if (user && !user.is_onboarding_complete && user.email !== 'demo@scn.com') {
    return <OnboardingWizard />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'calculator':
        return <CarbonCalculator onViewChange={setCurrentView} />;
      case 'history':
        return <FootprintHistory />;
      case 'conversational':
        return <ConversationalDataEntry />;
      case 'ewaste':
        return <EwasteTracker />;
      case 'impact':
        return <ImpactViewer />;
      case 'offsets':
        return <EnhancedCarbonOffsets />;
      case 'reports':
        return <Reports />;
      case 'ai-insights':
        return <AIInsights />;
      case 'compliance':
        return <CSRDCompliance />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
      <HelpButton />
      <HelpTooltipPortal />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <HelpProvider>
        <AppContent />
      </HelpProvider>
    </AuthProvider>
  );
}

export default App;
