import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Download, Brain, BarChart3, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [appId, setAppId] = useState('');
  const [storeType, setStoreType] = useState('apple');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentJob, setCurrentJob] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const navigate = useNavigate();

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

  // Poll job status every 2 seconds
  useEffect(() => {
    let pollInterval;
    
    if (currentJob && jobStatus?.status && !['completed', 'failed'].includes(jobStatus.status)) {
      pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8888/api/jobs/status/${currentJob}`);
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
  }, [currentJob, jobStatus?.status, navigate]);

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
      const response = await axios.post('http://127.0.0.1:8888/api/jobs/analyze', {
        appId: appId.trim(),
        storeType,
        limit: 100
      });

      if (response.data.success) {
        const job = response.data.data;
        setCurrentJob(job.jobId);
        setJobStatus(job);
        console.log(`Created analysis job ${job.jobId} for app ${job.appId}`);
        
        // Start polling for status updates
        // The useEffect will handle the polling
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          App Feedback Analysis Tool
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Analyze app store reviews with AI to understand user sentiment and extract actionable insights
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">1. Download Reviews</h3>
          <p className="text-gray-600">Fetch all reviews from Apple App Store or Google Play Store</p>
        </div>
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">2. AI Analysis</h3>
          <p className="text-gray-600">Analyze reviews using LLM to categorize and extract insights</p>
        </div>
        <div className="text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">3. Get Insights</h3>
          <p className="text-gray-600">View detailed analysis with features, issues, and improvements</p>
        </div>
      </div>

      <div className="card max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="appId" className="block text-sm font-medium text-gray-700 mb-2">
              App ID
            </label>
            <input
              type="text"
              id="appId"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="Enter App Store ID or Google Play Package Name"
              className="input-field"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              For Apple: Use the numeric ID (e.g., 284882215 for Facebook)<br/>
              For Google Play: Use the package name (e.g., com.facebook.katana)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="storeType"
                  value="apple"
                  checked={storeType === 'apple'}
                  onChange={(e) => setStoreType(e.target.value)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <Smartphone className="w-5 h-5 mr-2" />
                Apple App Store
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="storeType"
                  value="google"
                  checked={storeType === 'google'}
                  onChange={(e) => setStoreType(e.target.value)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <Smartphone className="w-5 h-5 mr-2" />
                Google Play Store
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-700">{error}</p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Job Progress Indicator */}
          {isLoading && jobStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  {jobStatus.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-blue-700">
                      {getStatusMessage(jobStatus.status)}
                    </span>
                    <span className="text-sm text-blue-600">{jobStatus.progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${jobStatus.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">{jobStatus.message}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                <span>
                  {jobStatus?.status === 'completed' ? 'Redirecting...' : 'Processing...'}
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Start Analysis</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">What You'll Get</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="card positive-card">
            <h3 className="text-lg font-semibold text-green-700 mb-3">Positive Insights</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Top features users love</li>
              <li>• Positive user experiences</li>
              <li>• What makes your app stand out</li>
              <li>• Strength highlights</li>
            </ul>
          </div>
          <div className="card negative-card">
            <h3 className="text-lg font-semibold text-red-700 mb-3">Improvement Areas</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Common issues and problems</li>
              <li>• Critical problems to fix</li>
              <li>• Suggested improvements</li>
              <li>• Priority action items</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 