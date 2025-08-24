import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getUserCredit } from '../lib/creditService';

const PurchaseCredits = () => {
  const navigate = useNavigate();
  const [currentCredits, setCurrentCredits] = useState(0);
  const [selectedTier, setSelectedTier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Credit tiers with pricing
  const creditTiers = [
    {
      id: 'starter',
      credits: 10,
      price: 1.00,
      popular: false,
      description: 'Perfect for trying out the platform'
    },
    {
      id: 'professional',
      credits: 50,
      price: 5.00,
      popular: true,
      description: 'Great for regular app analysis'
    },
    {
      id: 'business',
      credits: 100,
      price: 10.00,
      popular: false,
      description: 'Ideal for multiple app projects'
    },
    {
      id: 'enterprise',
      credits: 500,
      price: 50.00,
      popular: false,
      description: 'Best value for large-scale analysis'
    }
  ];

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

  const handlePurchase = async (tier) => {
    setIsLoading(true);
    setError('');
    setSelectedTier(tier.id);

    try {
      // TODO: Integrate with Stripe or payment processor
      // For now, we'll simulate the purchase
      console.log(`Purchasing ${tier.credits} credits for $${tier.price}`);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add credits to user account (this would normally happen after successful payment)
      const response = await fetch('/api/credit/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ amount: tier.credits })
      });

      if (response.ok) {
        await loadCurrentCredits();
        // Show success message and redirect
        alert(`Successfully purchased ${tier.credits} credits!`);
        navigate('/');
      } else {
        throw new Error('Failed to add credits');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedTier(null);
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

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {creditTiers.map((tier) => (
            <div 
              key={tier.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                tier.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                    {tier.id}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {tier.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {tier.credits}
                      </span>
                      <span className="text-gray-600">credits</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-2xl font-semibold text-blue-600">
                        ${tier.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        (${(tier.price / tier.credits).toFixed(2)} per credit)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(tier)}
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      tier.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${
                      isLoading && selectedTier === tier.id
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:shadow-lg transform hover:-translate-y-1'
                    }`}
                  >
                    {isLoading && selectedTier === tier.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Purchase'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">$0.10</div>
                <div className="text-gray-600">per credit</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">1</div>
                <div className="text-gray-600">credit per app</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">∞</div>
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
