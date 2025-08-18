import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Brain, 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star,
  Search,
  Zap,
  Shield,
  Award
} from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { FaApple, FaAndroid } from 'react-icons/fa';

const Home = () => {
  const [appId, setAppId] = useState('');
  const [storeType, setStoreType] = useState('apple');
  const [detectedStore, setDetectedStore] = useState(null);
  const [normalizedFromUrl, setNormalizedFromUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentJob, setCurrentJob] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const navigate = useNavigate();

  // Store detection from raw input (URL/package/numeric)
  const detectStoreFromInput = (rawInput) => {
    if (!rawInput || typeof rawInput !== 'string') return null;
    const input = rawInput.trim();
    // URL handling
    if (input.startsWith('http://') || input.startsWith('https://')) {
      try {
        const url = new URL(input);
        const host = url.hostname.toLowerCase();
        if (host.includes('play.google.com')) {
          const pkg = url.searchParams.get('id');
          if (pkg && /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/.test(pkg)) {
            return { appId: pkg, storeType: 'google', reason: 'google_url' };
          }
        }
        if (host.includes('apps.apple.com')) {
          const match = url.pathname.match(/id(\d{5,})/i);
          if (match && match[1]) {
            return { appId: match[1], storeType: 'apple', reason: 'apple_url' };
          }
        }
      } catch (e) {
        // ignore
      }
    }
    // Numeric Apple ID
    if (/^\d{5,}$/.test(input)) {
      return { appId: input, storeType: 'apple', reason: 'numeric_id' };
    }
    // Android package pattern
    if (/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/.test(input)) {
      return { appId: input, storeType: 'google', reason: 'android_package' };
    }
    // Apple id embedded
    const appleIdMatch = input.match(/id(\d{5,})/i);
    if (appleIdMatch && appleIdMatch[1]) {
      return { appId: appleIdMatch[1], storeType: 'apple', reason: 'apple_id_in_text' };
    }
    return null;
  };

  // Helper function to get user-friendly status messages
  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Starting analysis...';
      case 'fetching_reviews':
        return 'Fetching app reviews...';
      case 'analyzing':
        return 'Analyzing with AI...';
      case 'completed':
        return 'Analysis completed!';
      case 'failed':
        return 'Analysis failed';
      default:
        return 'Processing...';
    }
  };

  // Reset function to clear all states
  const resetForm = () => {
    setError('');
    setIsLoading(false);
    setCurrentJob(null);
    setJobStatus(null);
  };

  // Poll job status every 2 seconds (disabled during cache-hit simulation)
  useEffect(() => {
    let pollInterval;
    
    if (!isSimulating && currentJob && jobStatus?.status && !['completed', 'failed'].includes(jobStatus.status)) {
      pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/jobs/status/${currentJob}`);
          if (response.data.success) {
            setJobStatus(response.data.data);
            
            // If job completed, navigate to results
            if (response.data.data.status === 'completed') {
              setTimeout(() => {
                navigate(`/analysis/${response.data.data.appId}`);
              }, 1000); // Small delay to show completion
            }
            
            // If job failed, show error
            if (response.data.data.status === 'failed') {
              setError(response.data.data.error || 'Job failed');
              setIsLoading(false);
              setCurrentJob(null);
              setJobStatus(null);
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 2000);
    }
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [currentJob, jobStatus?.status, navigate, isSimulating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appId.trim()) {
      setError('Please enter an App ID');
      return;
    }

    // Reset form state before starting
    resetForm();
    setIsLoading(true);

    try {
      // Submit analysis job
      const response = await axios.post('/api/jobs/analyze', {
        appId: appId.trim(),
        // Allow backend to auto-detect based on input
        storeType: 'auto',
        // Pagination defaults (can be surfaced in advanced options later)
        usePagination: true,
        pageSize: storeType === 'google' ? 100 : undefined,
      });

      if (response.data.success) {
        const job = response.data.data;
        setCurrentJob(job.jobId);
        setJobStatus(job);
        console.log(`Created analysis job ${job.jobId} for app ${job.appId}`);

        // If cache hit: simulate progress for 2-3 seconds before redirect
        if (job.status === 'completed') {
          setIsSimulating(true);
          let simulated = 0;
          const targetMs = 3000 + Math.floor(Math.random() * 1000); // 2-3s
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            simulated = Math.min(100, Math.floor((elapsed / targetMs) * 100));
              setJobStatus(prev => ({
                ...(prev || job),
                status: 'analyzing',
                progress: Math.max(prev?.progress || 0, simulated),
                message: 'Preparing analysis...'
              }));
            if (elapsed >= targetMs) {
              setIsSimulating(false);
              setIsLoading(false);
              navigate(`/analysis/${job.appId}`);
            } else {
              requestAnimationFrame(tick);
            }
          };
          requestAnimationFrame(tick);
          return;
        }

        // Otherwise, the useEffect will begin polling
      } else {
        setError('Failed to start analysis');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      setError(error.response?.data?.error || error.response?.data?.details || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>App Feedback Analysis | Fetch and Analyze App Store Reviews with AI</title>
        <meta name="description" content="Analyze Apple App Store and Google Play Store reviews with AI to extract features, issues, sentiment, and actionable insights." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.origin : ''} />
        <meta property="og:title" content="App Feedback Analysis" />
        <meta property="og:description" content="AI-powered analysis of app store reviews for actionable insights." />
      </Helmet>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-24">
          <div className="text-center">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              AI-Powered Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              Transform App Reviews Into
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Actionable Insights</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Leverage advanced AI to analyze thousands of app store reviews instantly. Understand what users love and what needs improvement with comprehensive sentiment analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 lg:-mt-12 mb-8 sm:mb-12 lg:mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <Download className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Data Collection</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Automatically fetch and organize reviews from Apple App Store and Google Play Store with intelligent filtering.</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">AI-Powered Analysis</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Advanced natural language processing identifies patterns, sentiment, and key themes in user feedback.</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Actionable Reports</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Get detailed insights with prioritized recommendations and competitive analysis metrics.</p>
          </div>
        </div>
      </div>

      {/* Analysis Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 lg:mb-16">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2 sm:mr-3" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Start Your Analysis</h2>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div>
                <label htmlFor="appId" className="block text-sm font-semibold text-gray-900 mb-3">
                  App Identifier
                </label>
                <div className="relative">
                <input
                  type="text"
                  id="appId"
                  value={appId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAppId(value);
                    setNormalizedFromUrl(false);
                    const detected = detectStoreFromInput(value);
                    if (detected) {
                      setDetectedStore(detected.storeType);
                      // If the detector normalized ID (e.g., from URL), update the field
                      if (detected.appId && detected.appId !== value) {
                        setAppId(detected.appId);
                        setNormalizedFromUrl(true);
                      }
                      if (detected.storeType !== storeType) {
                        setStoreType(detected.storeType);
                      }
                    } else {
                      setDetectedStore(null);
                    }
                  }}
                    placeholder="Enter App Store ID or Google Play Package Name"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
                <div className="mt-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaApple className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-900" />
                        <span><strong>Apple:</strong> Numeric ID (e.g., 284882215)</span>
                      </div>
                      <div className="flex items-center">
                        <FaAndroid className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-600" />
                        <span><strong>Google:</strong> Package name (e.g., com.facebook.katana)</span>
                      </div>
                    </div>
                  {detectedStore && (
                    <div className="mt-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium ${
                        detectedStore === 'apple' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {detectedStore === 'apple' ? 'Detected: Apple App Store' : 'Detected: Google Play Store'}
                      </span>
                      {normalizedFromUrl && (
                        <span className="ml-2 text-gray-500">(Normalized ID from URL)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 sm:mb-4">
                  Platform Selection
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                    storeType === 'apple' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="storeType"
                      value="apple"
                      checked={storeType === 'apple'}
                      onChange={(e) => setStoreType(e.target.value)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <div className="flex items-center flex-1">
                      <div className="bg-black p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                        <FaApple className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">Apple App Store</div>
                        <div className="text-xs sm:text-sm text-gray-500">iOS applications</div>
                      </div>
                    </div>
                    {storeType === 'apple' && (
                      <CheckCircle className="w-5 h-5 text-blue-500 ml-2" />
                    )}
                  </label>
                  
                  <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                    storeType === 'google' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="storeType"
                      value="google"
                      checked={storeType === 'google'}
                      onChange={(e) => setStoreType(e.target.value)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <div className="flex items-center flex-1">
                      <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                        <FaAndroid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">Google Play Store</div>
                        <div className="text-xs sm:text-sm text-gray-500">Android applications</div>
                      </div>
                    </div>
                    {storeType === 'google' && (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                    )}
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-800">Analysis Error</h3>
                      <p className="text-red-700 mt-1">{error}</p>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Progress Indicator */}
              {isLoading && jobStatus && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      {jobStatus.status === 'completed' ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 text-lg">
                        {getStatusMessage(jobStatus.status)}
                      </h3>
                      <p className="text-blue-700 text-sm">{jobStatus.message}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{typeof jobStatus.progress === 'number' ? Math.max(1, jobStatus.progress) : 1}%</div>
                      <div className="text-xs text-blue-500">Complete</div>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${typeof jobStatus.progress === 'number' ? Math.max(1, Math.min(100, jobStatus.progress)) : 1}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl text-base sm:text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                    <span>
                      {jobStatus?.status === 'completed' ? 'Redirecting to Results...' : 'Processing Analysis...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Search className="w-5 h-5 mr-3" />
                    <span>Start AI Analysis</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Enhanced Results Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 lg:mb-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">Comprehensive Analysis Results</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Get detailed insights that drive product decisions and improve user satisfaction
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Positive Insights Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white mr-3 sm:mr-4" />
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Positive Insights</h3>
                  <p className="text-green-100 text-sm sm:text-base">What users love about your app</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Top-Rated Features</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Identify the most beloved functionalities and experiences</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">User Experience Highlights</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Discover positive user journeys and satisfaction drivers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Competitive Advantages</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Understand what makes your app stand out from competitors</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Strength Amplification</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Strategic recommendations to leverage your strengths</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Negative Insights Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex items-center">
                <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white mr-3 sm:mr-4" />
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Improvement Opportunities</h3>
                  <p className="text-red-100 text-sm sm:text-base">Areas for enhancement and growth</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Critical Issues</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">High-priority problems requiring immediate attention</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Common Pain Points</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Frequently mentioned issues across user reviews</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Actionable Solutions</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Specific improvement recommendations with priority levels</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Implementation Roadmap</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Prioritized action plan for maximum impact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 