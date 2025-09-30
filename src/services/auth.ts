import { buildApiUrl } from '../utils/api';

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
}

export const authService = {
  async sendVerificationEmail(email: string): Promise<EmailVerificationResponse> {
    const response = await fetch(buildApiUrl('/api/v1/users/email/send-verification/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send verification email');
    }

    return response.json();
  },

  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    const response = await fetch(buildApiUrl('/api/v1/users/email/verify/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Email verification failed');
    }

    return response.json();
  },

  async sendPasswordReset(email: string): Promise<PasswordResetResponse> {
    const response = await fetch(buildApiUrl('/api/v1/users/email/password-reset/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send password reset email');
    }

    return response.json();
  },

  async confirmPasswordReset(token: string, password: string): Promise<PasswordResetConfirmResponse> {
    const response = await fetch(buildApiUrl('/api/v1/users/email/password-reset-confirm/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password reset failed');
    }

    return response.json();
  },
};
