import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PricingSection from '../PricingSection';
import * as AuthContext from '../../../contexts/AuthContext';

// Mock the AuthContext
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the Stripe service
vi.mock('../../../services/stripe', () => ({
  getStripe: vi.fn(() => Promise.resolve({})),
}));

// Mock the API utils
vi.mock('../../../utils/api', () => ({
  buildApiUrl: (path: string) => `http://localhost:8000${path}`,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('PricingSection', () => {
  const mockRegister = vi.fn();
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default auth context mock
    (AuthContext.useAuth as any).mockReturnValue({
      register: mockRegister,
      login: mockLogin,
      logout: mockLogout,
      user: null,
      isAuthenticated: false,
    });

    // Mock fetch
    (globalThis as any).fetch = vi.fn();
  });

  describe('Tier Display', () => {
    it('renders all four pricing tiers', () => {
      render(<PricingSection />);
      
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('displays correct pricing for each tier', () => {
      render(<PricingSection />);
      
      // Free tier
      expect(screen.getByText(/£0.00/)).toBeInTheDocument();
      
      // Starter tier
      expect(screen.getByText(/£9.99/)).toBeInTheDocument();
      
      // Professional tier
      expect(screen.getByText(/£19.99/)).toBeInTheDocument();
      
      // Enterprise tier
      expect(screen.getByText(/£30/)).toBeInTheDocument();
    });

    it('shows "Most Popular" badge on Professional tier', () => {
      render(<PricingSection />);
      
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });
  });

  describe('Currency Selection', () => {
    it('renders currency selector', () => {
      render(<PricingSection />);
      
      // Currency selector should be present
      const selectors = screen.getAllByRole('combobox');
      expect(selectors.length).toBeGreaterThan(0);
    });
  });

  describe('Tier Selection', () => {
    it('opens onboarding modal when free tier is selected', async () => {
      const user = userEvent.setup();
      render(<PricingSection />);
      
      const freeButton = screen.getByRole('button', { name: /get started free/i });
      await user.click(freeButton);
      
      // Onboarding modal should open
      await waitFor(() => {
        expect(screen.getByText(/welcome to verdant by scn/i)).toBeInTheDocument();
      });
    });

    it('opens onboarding modal when starter tier is selected', async () => {
      const user = userEvent.setup();
      render(<PricingSection />);
      
      const starterButton = screen.getByRole('button', { name: /start free trial/i });
      await user.click(starterButton);
      
      await waitFor(() => {
        expect(screen.getByText(/welcome to verdant by scn/i)).toBeInTheDocument();
      });
    });

    it('opens email client for enterprise tier', async () => {
      const user = userEvent.setup();
      
      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;
      
      render(<PricingSection />);
      
      const enterpriseButton = screen.getByRole('button', { name: /contact sales/i });
      await user.click(enterpriseButton);
      
      expect(window.location.href).toContain('mailto:');
      expect(window.location.href).toContain('hello@donatecomputers.uk');
    });
  });

  describe('Free Tier Signup Flow', () => {
    beforeEach(() => {
      mockRegister.mockResolvedValue(undefined);
      
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => 'mock_token'),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true,
      });
    });

    it('registers user and redirects for free tier', async () => {
      const user = userEvent.setup();
      
      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '', origin: 'http://localhost' } as any;
      
      render(<PricingSection />);
      
      // Click free tier
      const freeButton = screen.getByRole('button', { name: /get started free/i });
      await user.click(freeButton);
      
      // Fill onboarding form
      await waitFor(() => {
        expect(screen.getByText(/welcome to verdant by scn/i)).toBeInTheDocument();
      });
      
      // Fill step 1
      await user.type(screen.getByPlaceholderText(/john/i), 'John');
      await user.type(screen.getByPlaceholderText(/smith/i), 'Smith');
      await user.type(screen.getByPlaceholderText(/john.smith@company.com/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next →/i }));
      
      // Fill step 2
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
      });
      
      await user.type(screen.getByPlaceholderText(/acme corporation/i), 'Test Company');
      const companySizeSelect = screen.getByRole('combobox', { name: /company size/i });
      await user.selectOptions(companySizeSelect, '11-50');
      const industrySelect = screen.getByRole('combobox', { name: /industry/i });
      await user.selectOptions(industrySelect, 'Technology');
      await user.click(screen.getByRole('button', { name: /next →/i }));
      
      // Fill step 3 (password)
      await waitFor(() => {
        expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByPlaceholderText(/create a secure password/i);
      const confirmInput = screen.getByPlaceholderText(/re-enter your password/i);
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmInput, 'SecurePassword123!');
      
      // Submit
      const createButton = screen.getByRole('button', { name: /create account/i });
      await user.click(createButton);
      
      // Verify registration was called
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'SecurePassword123!',
          first_name: 'John',
          last_name: 'Smith',
          company: 'Test Company',
        });
      });
      
      // Should redirect to login
      await waitFor(() => {
        expect(window.location.href).toContain('/login?registered=true');
      });
    });
  });

  describe('Paid Tier Checkout Flow', () => {
    beforeEach(() => {
      mockRegister.mockResolvedValue(undefined);
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => 'mock_access_token'),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true,
      });
      
      // Mock fetch for tiers and checkout
      ((globalThis as any).fetch as any).mockImplementation((url: string) => {
        if (url.includes('/tiers/public/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, tier: 'free', name: 'Free' },
              { id: 2, tier: 'starter', name: 'Starter' },
              { id: 3, tier: 'professional', name: 'Professional' },
            ]),
          });
        }
        
        if (url.includes('/create_checkout_session/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              checkout_url: 'https://checkout.stripe.com/test',
              session_id: 'cs_test_123',
            }),
          });
        }
        
        return Promise.reject(new Error('Unknown URL'));
      });
    });

    it('creates checkout session for paid tier', async () => {
      const user = userEvent.setup();
      
      delete (window as any).location;
      window.location = { href: '', origin: 'http://localhost' } as any;
      
      render(<PricingSection />);
      
      // Click starter tier
      const starterButton = screen.getByRole('button', { name: /start free trial/i });
      await user.click(starterButton);
      
      // Fill onboarding
      await waitFor(() => {
        expect(screen.getByText(/welcome to verdant by scn/i)).toBeInTheDocument();
      });
      
      await user.type(screen.getByPlaceholderText(/john/i), 'John');
      await user.type(screen.getByPlaceholderText(/smith/i), 'Smith');
      await user.type(screen.getByPlaceholderText(/john.smith@company.com/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next →/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
      });
      
      await user.type(screen.getByPlaceholderText(/acme corporation/i), 'Test Company');
      const companySizeSelect = screen.getByRole('combobox', { name: /company size/i });
      await user.selectOptions(companySizeSelect, '11-50');
      const industrySelect = screen.getByRole('combobox', { name: /industry/i });
      await user.selectOptions(industrySelect, 'Technology');
      await user.click(screen.getByRole('button', { name: /next →/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByPlaceholderText(/create a secure password/i);
      const confirmInput = screen.getByPlaceholderText(/re-enter your password/i);
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmInput, 'SecurePassword123!');
      
      const paymentButton = screen.getByRole('button', { name: /continue to payment/i });
      await user.click(paymentButton);
      
      // Verify registration and checkout
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
        expect((globalThis as any).fetch).toHaveBeenCalledWith(
          expect.stringContaining('/tiers/public/'),
          expect.any(Object)
        );
      });
      
      // Should redirect to Stripe
      await waitFor(() => {
        expect(window.location.href).toContain('stripe.com');
      }, { timeout: 5000 });
    });
  });

  describe('Error Handling', () => {
    it('shows error alert when registration fails', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue(new Error('Registration failed'));
      
      // Mock window.alert
      window.alert = vi.fn();
      
      render(<PricingSection />);
      
      const freeButton = screen.getByRole('button', { name: /get started free/i });
      await user.click(freeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/welcome to verdant by scn/i)).toBeInTheDocument();
      });
      
      // Fill and submit form
      await user.type(screen.getByPlaceholderText(/john/i), 'John');
      await user.type(screen.getByPlaceholderText(/smith/i), 'Smith');
      await user.type(screen.getByPlaceholderText(/john.smith@company.com/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next →/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/about your organization/i)).toBeInTheDocument();
      });
      
      await user.type(screen.getByPlaceholderText(/acme corporation/i), 'Test Company');
      const companySizeSelect = screen.getByRole('combobox', { name: /company size/i });
      await user.selectOptions(companySizeSelect, '11-50');
      const industrySelect = screen.getByRole('combobox', { name: /industry/i });
      await user.selectOptions(industrySelect, 'Technology');
      await user.click(screen.getByRole('button', { name: /next →/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByPlaceholderText(/create a secure password/i);
      const confirmInput = screen.getByPlaceholderText(/re-enter your password/i);
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmInput, 'SecurePassword123!');
      
      const createButton = screen.getByRole('button', { name: /create account/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Registration failed'));
      });
    });
  });
});
