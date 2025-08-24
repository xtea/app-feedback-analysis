import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getUserCredit } from '../lib/creditService';

const PurchaseCredits = () => {
  const navigate = useNavigate();
  const [currentCredits, setCurrentCredits] = useState(0);
  const [creditsToBuy, setCreditsToBuy] = useState(25); // Default to minimum
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Pricing constants
  const CREDITS_PER_DOLLAR = 5; // $1 = 5 credits
  const MINIMUM_PURCHASE_USD = 5; // Minimum $5 purchase
  const MINIMUM_CREDITS = MINIMUM_PURCHASE_USD * CREDITS_PER_DOLLAR; // 25 credits
  const MAXIMUM_CREDITS = 5000; // Maximum 5000 credits
  const PRICE_PER_CREDIT = 1 / CREDITS_PER_DOLLAR; // $0.20 per credit

  // Calculate total price
  const totalPrice = (creditsToBuy && !isNaN(creditsToBuy) ? (creditsToBuy * PRICE_PER_CREDIT).toFixed(2) : '0.00');

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    }
  }, [navigate]);

  const loadCurrentCredits = useCallback(async () => {
    try {
      const balance = await getUserCredit();
      if (balance.success) {
        setCurrentCredits(balance.credit);
      }
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  }, []);

  useEffect(() => {
    checkUser();
    loadCurrentCredits();
  }, [checkUser, loadCurrentCredits]);

  // Validate credit amount
  const validateCredits = (value) => {
    if (value === '' || value === null || value === undefined) {
      return 'Please enter a number of credits';
    }
    
    // Check if it's a valid number
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    
    // Check if it's an integer (no decimals)
    if (!Number.isInteger(numValue)) {
      return 'Only whole numbers are allowed (no decimals)';
    }
    
    // Check minimum range
    if (numValue < MINIMUM_CREDITS) {
      return `Minimum purchase is ${MINIMUM_CREDITS} credits ($${MINIMUM_PURCHASE_USD.toFixed(2)})`;
    }
    
    // Check maximum range
    if (numValue > MAXIMUM_CREDITS) {
      return `Maximum purchase is ${MAXIMUM_CREDITS} credits ($${(MAXIMUM_CREDITS * PRICE_PER_CREDIT).toFixed(2)})`;
    }
    
    return '';
  };

  // Handle credit input change
  const handleCreditsChange = (e) => {
    const value = e.target.value;
    
    // Allow empty string for better UX when user is typing
    if (value === '') {
      setCreditsToBuy('');
      setValidationError('Please enter a number of credits');
      return;
    }
    
    // Only allow numeric input (integers only, no decimals)
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue !== value) {
      // If user tried to enter non-numeric characters, don't update
      return;
    }
    
    const intValue = parseInt(numericValue) || 0;
    setCreditsToBuy(intValue);
    setValidationError(validateCredits(intValue));
  };

  const handlePurchase = async () => {
    const validation = validateCredits(creditsToBuy);
    if (validation) {
      setValidationError(validation);
      return;
    }

    setIsLoading(true);
    setError('');
    setValidationError('');

    try {
      // TODO: Integrate with Stripe or payment processor
      // For now, we'll simulate the purchase
      console.log(`Purchasing ${creditsToBuy} credits for $${totalPrice}`);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add credits to user account (this would normally happen after successful payment)
      const response = await fetch('/api/credit/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ amount: creditsToBuy })
      });

      if (response.ok) {
        await loadCurrentCredits();
        // Refresh header credit display
        if (window.refreshHeaderCredit) {
          window.refreshHeaderCredit();
        }
        // Show success message and redirect
        alert(`Successfully purchased ${creditsToBuy} credits for $${totalPrice}!`);
        navigate('/');
      } else {
        throw new Error('Failed to add credits');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: '📊',
      title: 'Full Analysis Reports',
      description: 'Get detailed sentiment analysis, feature insights, and improvement suggestions for any app'
    },
    {
      icon: '📄',
      title: 'PDF Export',
      description: 'Download professional PDF reports to share with your team or stakeholders'
    },
    {
      icon: '♻️',
      title: 'Multiple Access',
      description: 'Access your analysis reports as many times as you want - no additional charges'
    },
    {
      icon: '🎯',
      title: 'One Credit Per App',
      description: 'Each unique app analysis costs only 1 credit, regardless of the number of reviews'
    },
    {
      icon: '⚡',
      title: '24-Hour Cache',
      description: 'Recent analyses are cached for 24 hours - no credit charge for cached results'
    },
    {
      icon: '🔄',
      title: 'Fresh Data',
      description: 'Get the latest reviews and insights every time you analyze an app'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Current Balance: <span className="font-semibold text-blue-600">{currentCredits} credits</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Purchase Credits
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full power of AI-driven app review analysis. 
            Choose the perfect credit package for your needs.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Credit Purchase */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Credits
              </h2>
              <p className="text-lg text-gray-600">
                Enter the number of credits you'd like to purchase
              </p>
            </div>

            <div className="space-y-6">
              {/* Credit Input */}
              <div>
                <label htmlFor="credits" className="block text-sm font-semibold text-gray-700 mb-3">
                  Number of Credits
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="credits"
                    min={MINIMUM_CREDITS}
                    max={MAXIMUM_CREDITS}
                    step="1"
                    value={creditsToBuy || ''}
                    onChange={handleCreditsChange}
                    placeholder={`Enter ${MINIMUM_CREDITS} - ${MAXIMUM_CREDITS} credits`}
                    className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
                {validationError && (
                  <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}
              </div>

              {/* Price Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${totalPrice}
                    </div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${PRICE_PER_CREDIT.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Per Credit</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {creditsToBuy && !isNaN(creditsToBuy) && creditsToBuy > 0 ? (
                        <>
                          <div className="text-sm text-gray-500 font-normal">
                            {creditsToBuy.toLocaleString()} + {currentCredits.toLocaleString()} =
                          </div>
                          <div className="text-2xl">
                            {(currentCredits + creditsToBuy).toLocaleString()}
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl">
                          {currentCredits.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Total After Purchase</div>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={isLoading || !!validationError || !creditsToBuy || creditsToBuy < MINIMUM_CREDITS || creditsToBuy > MAXIMUM_CREDITS}
                className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 ${
                  isLoading || !!validationError || !creditsToBuy || creditsToBuy < MINIMUM_CREDITS || creditsToBuy > MAXIMUM_CREDITS
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  `Purchase ${creditsToBuy && !isNaN(creditsToBuy) ? creditsToBuy.toLocaleString() : '0'} Credits for $${totalPrice}`
                )}
              </button>

              {/* Purchase Range Note */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Purchase range: {MINIMUM_CREDITS} - {MAXIMUM_CREDITS} credits (${MINIMUM_PURCHASE_USD.toFixed(2)} - ${(MAXIMUM_CREDITS * PRICE_PER_CREDIT).toFixed(2)})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What You Get With Credits
            </h2>
            <p className="text-lg text-gray-600">
              Unlock powerful features to analyze and understand your app's user feedback
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-4xl mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Simple, Fair Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">${PRICE_PER_CREDIT.toFixed(2)}</div>
                <div className="text-gray-600">per credit</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{CREDITS_PER_DOLLAR}</div>
                <div className="text-gray-600">credits per $1</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">1</div>
                <div className="text-gray-600">credit per app</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">∞</div>
                <div className="text-gray-600">report access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCredits;
