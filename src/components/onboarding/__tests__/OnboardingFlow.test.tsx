import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFlow } from '../OnboardingFlow';

describe('OnboardingFlow', () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    selectedTier: 'starter' as const,
    tierPrice: 9.99,
    currency: 'GBP',
    onComplete: mockOnComplete,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    mockOnComplete.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Step 1: Personal Information', () => {
    it('renders first step with personal information fields', () => {
      render(<OnboardingFlow {...defaultProps} />);
      
      expect(screen.getByText(/tell us about yourself/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Smith')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/john.smith@company.com/i)).toBeInTheDocument();
    });

    it('validates required fields on step 1', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      const emailInput = screen.getByPlaceholderText(/john.smith@company.com/i);
      await user.type(emailInput, 'invalid-email');
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    it('proceeds to step 2 with valid data', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      await user.type(screen.getByPlaceholderText('John'), 'John');
      await user.type(screen.getByPlaceholderText('Smith'), 'Smith');
      await user.type(screen.getByPlaceholderText(/john.smith@company.com/i), 'john@example.com');
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Company Information', () => {
    const fillStep1 = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByPlaceholderText('John'), 'John');
      await user.type(screen.getByPlaceholderText('Smith'), 'Smith');
      await user.type(screen.getByPlaceholderText(/john.smith@company.com/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next/i }));
    };

    it('renders company information fields on step 2', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      await fillStep1(user);
      
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/acme corporation/i)).toBeInTheDocument();
      });
    });

    it('validates required company fields', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      await fillStep1(user);
      
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
      });
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please select company size/i)).toBeInTheDocument();
      expect(screen.getByText(/please select an industry/i)).toBeInTheDocument();
    });

    it('allows going back to step 1', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      await fillStep1(user);
      
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
      });
      
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);
      
      expect(screen.getByText(/tell us about yourself/i)).toBeInTheDocument();
    });
  });

  describe('Step 3: Password Setup', () => {
    const fillStep1And2 = async (user: ReturnType<typeof userEvent.setup>) => {
      // Step 1 - use exact placeholder text for precision
      await user.type(screen.getByPlaceholderText('John'), 'John');
      await user.type(screen.getByPlaceholderText('Smith'), 'Smith');
      await user.type(screen.getByPlaceholderText(/john.smith@company.com/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      // Step 2
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
      });
      
      await user.type(screen.getByPlaceholderText(/acme corporation/i), 'Test Company');
      const companySizeSelect = screen.getByRole('combobox', { name: /company size/i });
      await user.selectOptions(companySizeSelect, '11-50');
      const industrySelect = screen.getByRole('combobox', { name: /industry/i });
      await user.selectOptions(industrySelect, 'Technology');
      
      await user.click(screen.getByRole('button', { name: /next/i }));
    };

    it('renders password fields on step 3 for non-enterprise tiers', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      await fillStep1And2(user);
      
      await waitFor(() => {
        expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/create a secure password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/re-enter your password/i)).toBeInTheDocument();
      });
    });

    it('validates password minimum length', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      await fillStep1And2(user);
      
      await waitFor(() => {
        expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByPlaceholderText(/create a secure password/i);
      await user.type(passwordInput, 'short');
      
      const submitButton = screen.getByRole('button', { name: /continue to payment/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    it('validates password confirmation match', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      await fillStep1And2(user);
      
      await waitFor(() => {
        expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByPlaceholderText(/create a secure password/i);
      const confirmInput = screen.getByPlaceholderText(/re-enter your password/i);
      
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmInput, 'DifferentPassword123!');
      
      const submitButton = screen.getByRole('button', { name: /continue to payment/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('completes onboarding with valid password', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      await fillStep1And2(user);
      
      await waitFor(() => {
        expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByPlaceholderText(/create a secure password/i);
      const confirmInput = screen.getByPlaceholderText(/re-enter your password/i);
      
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmInput, 'SecurePassword123!');
      
      const submitButton = screen.getByRole('button', { name: /continue to payment/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          companyName: 'Test Company',
          companySize: '11-50',
          industry: 'Technology',
          phone: '',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!',
        });
      });
    });
  });

  describe('Free Tier Flow', () => {
    it('shows "Create Account" button for free tier', async () => {
      const user = userEvent.setup();
      const freeProps = { ...defaultProps, selectedTier: 'free' as const, tierPrice: 0 };
      render(<OnboardingFlow {...freeProps} />);
      
      // Fill all steps
      await user.type(screen.getByPlaceholderText('John'), 'John');
      await user.type(screen.getByPlaceholderText('Smith'), 'Smith');
      await user.type(screen.getByPlaceholderText(/john.smith@company.com/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
      });
      
      await user.type(screen.getByPlaceholderText(/acme corporation/i), 'Test Company');
      const companySizeSelect = screen.getByRole('combobox', { name: /company size/i });
      await user.selectOptions(companySizeSelect, '11-50');
      const industrySelect = screen.getByRole('combobox', { name: /industry/i });
      await user.selectOptions(industrySelect, 'Technology');
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByPlaceholderText(/create a secure password/i);
      const confirmInput = screen.getByPlaceholderText(/re-enter your password/i);
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmInput, 'SecurePassword123!');
      
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
  });

  describe('Enterprise Tier Flow', () => {
    it('shows enterprise contact message instead of password for enterprise tier', async () => {
      const user = userEvent.setup();
      const enterpriseProps = { ...defaultProps, selectedTier: 'enterprise' as const, tierPrice: 30 };
      render(<OnboardingFlow {...enterpriseProps} />);
      
      // Fill steps 1 and 2
      await user.type(screen.getByPlaceholderText('John'), 'John');
      await user.type(screen.getByPlaceholderText('Smith'), 'Smith');
      await user.type(screen.getByPlaceholderText(/john.smith@company.com/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
      });
      
      await user.type(screen.getByPlaceholderText(/acme corporation/i), 'Test Company');
      const companySizeSelect = screen.getByRole('combobox', { name: /company size/i });
      await user.selectOptions(companySizeSelect, '1001+');
      const industrySelect = screen.getByRole('combobox', { name: /industry/i });
      await user.selectOptions(industrySelect, 'Technology');
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/enterprise contact/i)).toBeInTheDocument();
        expect(screen.getByText(/thank you for your interest in our enterprise plan/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel when cancel is clicked on step 1', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls onCancel when X button is clicked', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: '' }); // X button
      await user.click(closeButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Progress Tracking', () => {
    it('displays correct step progress', () => {
      render(<OnboardingFlow {...defaultProps} />);
      
      expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
      expect(screen.getByText(/33% complete/i)).toBeInTheDocument();
    });

    it('updates progress as user advances', async () => {
      const user = userEvent.setup();
      render(<OnboardingFlow {...defaultProps} />);
      
      await user.type(screen.getByPlaceholderText('John'), 'John');
      await user.type(screen.getByPlaceholderText('Smith'), 'Smith');
      await user.type(screen.getByPlaceholderText(/john.smith@company.com/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();
        expect(screen.getByText(/67% complete/i)).toBeInTheDocument();
      });
    });
  });
});
