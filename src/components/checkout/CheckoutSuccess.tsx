/**
 * CheckoutSuccess Component
 * 
 * Displayed after successful Stripe checkout
 */

import React, { useEffect, useState } from 'react';

export const CheckoutSuccess: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session_id from URL query params
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session_id');
    setSessionId(id);
    
    // Simulate processing delay
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const handleContinue = () => {
    // Redirect to login or dashboard
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Verdant By SCN! 🎉
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Your subscription has been successfully activated.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            ✓ Payment confirmed<br />
            ✓ Account provisioned<br />
            ✓ Welcome email sent
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Check your email for login credentials and getting started guide.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Go to Dashboard
          </button>
          
          <a
            href="/"
            className="block w-full text-gray-600 hover:text-gray-900 text-sm"
          >
            Return to Homepage
          </a>
        </div>

        {/* Session Info (for debugging) */}
        {sessionId && (
          <p className="mt-6 text-xs text-gray-400">
            Session ID: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
