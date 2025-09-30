import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import { buildApiUrl, getApiBaseUrl } from '../utils/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  is_staff: boolean;
  is_email_verified?: boolean;
  is_onboarding_complete?: boolean;
  isFirstLogin?: boolean;
  role?: 'admin' | 'sustainability_manager' | 'decision_maker' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  sendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, password: string) => Promise<void>;
  completeOnboarding: (onboardingData: OnboardingData) => Promise<void>;
}

interface OnboardingData {
  company_name: string;
  industry: string;
  employees: number;
  sustainability_goals: string[];
  reporting_requirements: string[];
  challenges: string[];
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const profileUrl = buildApiUrl('/api/v1/users/auth/profile/');
        const response = await fetch(profileUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Debug logging
    console.log('🔍 LOGIN DEBUG INFO:');
    console.log('API base URL:', apiBaseUrl);
    const env = (import.meta as { env?: Record<string, string | undefined> }).env || {};
    console.log('Environment variables:', {
      VITE_API_URL: env.VITE_API_URL,
      VITE_BACKEND_URL: env.VITE_BACKEND_URL,
      NODE_ENV: env.NODE_ENV,
      MODE: env.MODE,
    });

    const loginUrl = buildApiUrl('/api/v1/users/auth/login/');
    console.log('Full login URL:', loginUrl);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Response status:', response.status);
    console.log('Response URL:', response.url);

    if (!response.ok) {
      const error = await response.json();
      console.error('Login error:', error);
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
  };

  const register = async (userData: RegisterData) => {
    const registerUrl = buildApiUrl('/api/v1/users/auth/register/');
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const sendVerificationEmail = async (email: string) => {
    await authService.sendVerificationEmail(email);
  };

  const verifyEmail = async (token: string) => {
    await authService.verifyEmail(token);
  };

  const sendPasswordReset = async (email: string) => {
    await authService.sendPasswordReset(email);
  };

  const confirmPasswordReset = async (token: string, password: string) => {
    await authService.confirmPasswordReset(token, password);
  };

  const completeOnboarding = async (onboardingData: OnboardingData) => {
    console.log('🚀 ONBOARDING DEBUG INFO:');
    console.log('Onboarding data:', onboardingData);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('❌ No authentication token found');
      throw new Error('No authentication token found');
    }
    console.log('🔑 Token found:', token.substring(0, 50) + '...');

    const onboardingUrl = buildApiUrl('/api/v1/users/auth/complete-onboarding/');
    console.log('🌐 Onboarding URL:', onboardingUrl);
    
    try {
      const response = await fetch(onboardingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(onboardingData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response URL:', response.url);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Onboarding error:', error);
        throw new Error(error.error || 'Onboarding completion failed');
      }

      const data = await response.json();
      console.log('✅ Onboarding success:', data);
      console.log('🔄 Old user state:', user);
      console.log('🔄 New user data from server:', data.user);
      console.log('🔄 New is_onboarding_complete:', data.user?.is_onboarding_complete);
      
      if (data.user) {
        setUser(data.user);
        console.log('✅ User state updated successfully');
      } else {
        console.error('❌ No user data in response');
    // Fallback: manually update the user state
    setUser((prevUser: User | null) => (prevUser ? { ...prevUser, is_onboarding_complete: true } : null));
        console.log('🔄 Manual user state update applied');
      }
    } catch (error) {
      console.error('💥 Onboarding exception:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    sendVerificationEmail,
    verifyEmail,
    sendPasswordReset,
    confirmPasswordReset,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
