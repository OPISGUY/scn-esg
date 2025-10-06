/**
 * Stripe Service
 * 
 * Handles Stripe.js initialization and configuration.
 * Uses environment variable VITE_STRIPE_PUBLISHABLE_KEY for the publishable key.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Singleton instance
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Load and return the Stripe instance
 * Uses singleton pattern to ensure only one instance is created
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    if (!stripePublishableKey) {
      console.warn('Stripe publishable key not found. Set VITE_STRIPE_PUBLISHABLE_KEY in .env');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(stripePublishableKey);
  }
  
  return stripePromise;
};

/**
 * Check if Stripe is properly configured
 */
export const isStripeConfigured = (): boolean => {
  return !!stripePublishableKey;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'GBP'): string => {
  const currencySymbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
};
