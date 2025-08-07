import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  AlertCircle, 
  Users,
  Target,
  Zap,
  Shield,
  Award,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Download
} from 'lucide-react';
import axios from 'axios';

const Analysis = () => {
  const { appId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [appId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalysis = async () => {
    try {
      const response = await axios.get(`/api/analysis/summary/${appId}`);
      if (response.data.success) {
        setAnalysis(response.data.data);
      } else {
        setError('Analysis not found');
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Analysis Found</h2>
        <p className="text-gray-600 mb-4">Please run an analysis first.</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  const { summary, positiveAnalysis, negativeAnalysis } = analysis;

  // Prepare chart data
  const sentimentData = [
    { name: 'Positive', value: summary.positiveCount, color: '#28a745' },
    { name: 'Negative', value: summary.negativeCount, color: '#dc3545' },
    { name: 'Neutral', value: summary.neutralCount, color: '#ffc107' }
  ];

  const ratingData = [
    { rating: '5★', count: summary.positiveCount },
    { rating: '4★', count: summary.positiveCount },
    { rating: '3★', count: summary.neutralCount },
    { rating: '2★', count: summary.negativeCount },
    { rating: '1★', count: summary.negativeCount }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  App Analysis Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  App ID: {appId} • Analyzed {new Date(analysis.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-secondary flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
              <Link to="/" className="btn-primary flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Overview */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{summary.totalReviews}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{summary.averageRating.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(summary.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positive Sentiment</p>
                <p className="text-3xl font-bold text-green-600">{summary.positivePercentage.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">{summary.positiveCount} reviews</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Negative Sentiment</p>
                <p className="text-3xl font-bold text-red-600">{summary.negativePercentage.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">{summary.negativeCount} reviews</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <ThumbsDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Sentiment Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Rating Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Positive Analysis */}
          {positiveAnalysis && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-white mr-4" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Strengths & Positives</h2>
                    <p className="text-green-100">What users love about your app</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Top Features */}
                <div>
                  <div className="flex items-center mb-4">
                    <Award className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Top-Rated Features</h3>
                  </div>
                  <div className="space-y-3">
                    {positiveAnalysis.topFeatures?.map((feature, index) => (
                      <div key={index} className="flex items-center p-3 bg-green-50 rounded-xl">
                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-800 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Experiences */}
                <div>
                  <div className="flex items-center mb-4">
                    <Users className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Positive Experiences</h3>
                  </div>
                  <div className="space-y-3">
                    {positiveAnalysis.positiveExperiences?.map((experience, index) => (
                      <div key={index} className="flex items-start p-3 bg-green-50 rounded-xl">
                        <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-800">{experience}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strength Highlights */}
                <div>
                  <div className="flex items-center mb-4">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Strategic Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    {positiveAnalysis.strengthHighlights?.map((highlight, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500">
                        <p className="text-gray-800 leading-relaxed">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Negative Analysis */}
          {negativeAnalysis && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 px-8 py-6">
                <div className="flex items-center">
                  <TrendingDown className="w-8 h-8 text-white mr-4" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Issues & Improvements</h2>
                    <p className="text-red-100">Areas that need attention</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Top Issues */}
                <div>
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Most Common Issues</h3>
                  </div>
                  <div className="space-y-3">
                    {negativeAnalysis.topIssues?.map((issue, index) => (
                      <div key={index} className="flex items-center p-3 bg-red-50 rounded-xl">
                        <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-800 font-medium">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Problems */}
                <div>
                  <div className="flex items-center mb-4">
                    <Target className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Critical Problems</h3>
                  </div>
                  <div className="space-y-3">
                    {negativeAnalysis.criticalProblems?.map((problem, index) => (
                      <div key={index} className="flex items-start p-3 bg-red-50 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-800">{problem}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Improvements */}
                <div>
                  <div className="flex items-center mb-4">
                    <Zap className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Action Plan</h3>
                  </div>
                  <div className="space-y-4">
                    {negativeAnalysis.suggestedImprovements?.map((improvement, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-900">{improvement.issue}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            improvement.priority === 'High' ? 'bg-red-100 text-red-800' :
                            improvement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {improvement.priority} Priority
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{improvement.improvement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis; 