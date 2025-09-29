import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import { API_URL } from '../utils/apiConfig';

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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await fetch(`${API_URL}/api/v1/users/auth/profile/`, {
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
    const loginUrl = `${API_URL}/api/v1/users/auth/login/`;
    console.log('Full login URL:', loginUrl);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

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
    const response = await fetch(`${API_URL}/api/v1/users/auth/register/`, {
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
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const onboardingUrl = `${API_URL}/api/v1/users/auth/complete-onboarding/`;
    
    try {
      const response = await fetch(onboardingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Onboarding completion failed');
      }

      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(prev => prev ? { ...prev, is_onboarding_complete: true } : null);
      }
    } catch (error) {
      console.error('Onboarding exception:', error);
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
