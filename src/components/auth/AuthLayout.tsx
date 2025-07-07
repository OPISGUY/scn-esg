import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupWizard from './SignupWizard';
import ForgotPasswordPage from './ForgotPasswordPage';
import EmailVerificationPage from './EmailVerificationPage';
import PasswordResetConfirmPage from './PasswordResetConfirmPage';

interface AuthLayoutProps {
  onComplete?: () => void;
  initialView?: AuthView;
  resetToken?: string;
  verificationEmail?: string;
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'email-verification' | 'password-reset-confirm';

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  onComplete, 
  initialView = 'login',
  resetToken,
  verificationEmail 
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [pendingEmail, setPendingEmail] = useState(verificationEmail || '');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginPage
            onSwitchToSignup={() => setCurrentView('signup')}
            onForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
      case 'signup':
        return (
          <SignupWizard
            onSwitchToLogin={() => setCurrentView('login')}
            onComplete={(email?: string) => {
              if (email) {
                setPendingEmail(email);
                setCurrentView('email-verification');
              } else {
                onComplete?.();
              }
            }}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordPage
            onBack={() => setCurrentView('login')}
          />
        );
      case 'email-verification':
        return (
          <EmailVerificationPage
            email={pendingEmail}
            onComplete={onComplete}
            onBack={() => setCurrentView('signup')}
          />
        );
      case 'password-reset-confirm':
        return (
          <PasswordResetConfirmPage
            token={resetToken}
            onComplete={() => setCurrentView('login')}
            onBack={() => setCurrentView('login')}
          />
        );
      default:
        return (
          <LoginPage
            onSwitchToSignup={() => setCurrentView('signup')}
            onForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
    }
  };

  return (
    <div className="auth-layout">
      {renderCurrentView()}
    </div>
  );
};

export default AuthLayout;
