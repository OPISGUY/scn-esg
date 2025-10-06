/**
 * CheckoutButton Component
 * 
 * Handles subscription checkout flow:
 * - FREE tier: Redirects to signup (no payment)
 * - Paid tiers: Creates Stripe Checkout session and redirects
 */

import React, { useState } from 'react';
import { getStripe } from '../../services/stripe';
import { buildApiUrl } from '../../utils/api';

interface CheckoutButtonProps {
  tierId: 'free' | 'starter' | 'professional' | 'enterprise';
  tierName?: string;
  price?: number;
  currency?: string;
  className?: string;
  children: React.ReactNode;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  tierId,
  currency = 'GBP',
  className = '',
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    
    // FREE tier: Just redirect to signup
    if (tierId === 'free') {
      window.location.href = '/signup';
      return;
    }

    // Enterprise tier: Contact sales
    if (tierId === 'enterprise') {
      window.location.href = 'mailto:hello@donatecomputers.uk?subject=Enterprise Plan Inquiry';
      return;
    }

    setLoading(true);

    try {
      // Get Stripe instance
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize. Please check your configuration.');
      }

      // Call backend to create checkout session
      const response = await fetch(buildApiUrl('/api/v1/subscriptions/create_checkout_session/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier_id: tierId,
          currency: currency.toLowerCase(),
          billing_cycle: 'monthly', // Default to monthly
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancelled`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout (using checkout_url from backend)
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default CheckoutButton;
