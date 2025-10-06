/**
 * CheckoutCancelled Component
 * 
 * Displayed when user cancels Stripe checkout
 */

import React from 'react';

export const CheckoutCancelled: React.FC = () => {
  const handleReturnToPricing = () => {
    // Scroll to pricing section on homepage
    window.location.href = '/#pricing';
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:hello@donatecomputers.uk?subject=Checkout Issue';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Cancelled Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
          <svg
            className="h-10 w-10 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Cancelled Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Your checkout was cancelled. No charges were made to your account.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Need help choosing the right plan?<br />
            Our team is here to assist you.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleReturnToPricing}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Return to Pricing
          </button>
          
          <button
            onClick={handleContactSupport}
            className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Contact Support
          </button>

          <a
            href="/"
            className="block w-full text-gray-600 hover:text-gray-900 text-sm pt-2"
          >
            Return to Homepage
          </a>
        </div>

        {/* Helpful Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Still interested? Try our free tier:
          </p>
          <a
            href="/signup"
            className="text-sm text-green-600 hover:text-green-700 font-semibold"
          >
            Get Started Free →
          </a>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelled;
