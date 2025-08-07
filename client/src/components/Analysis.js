import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Star, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const Analysis = () => {
  const { appId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [appId]);

  const fetchAnalysis = async () => {
    try {
      const response = await axios.get(`http://localhost:8888/api/analysis/summary/${appId}`);
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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analysis Results for {appId}
          </h1>
          <p className="text-gray-600">
            Analyzed on {new Date(analysis.timestamp).toLocaleDateString()}
          </p>
        </div>
        <Link to="/" className="btn-secondary">
          <ArrowLeft className="w-5 h-5 mr-2" />
          New Analysis
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{summary.totalReviews}</div>
          <div className="text-gray-600">Total Reviews</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{summary.averageRating.toFixed(1)}</div>
          <div className="text-gray-600">Average Rating</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{summary.positivePercentage.toFixed(1)}%</div>
          <div className="text-gray-600">Positive</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{summary.negativePercentage.toFixed(1)}%</div>
          <div className="text-gray-600">Negative</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
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

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Positive Analysis */}
      {positiveAnalysis && (
        <div className="card positive-card mb-8">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-semibold text-green-700">Positive Insights</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">Top Features</h3>
              <ul className="space-y-2">
                {positiveAnalysis.topFeatures?.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">User Experiences</h3>
              <ul className="space-y-2">
                {positiveAnalysis.positiveExperiences?.map((experience, index) => (
                  <li key={index} className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    {experience}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-green-700">Strength Highlights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {positiveAnalysis.strengthHighlights?.map((highlight, index) => (
                <div key={index} className="bg-green-50 p-3 rounded-md">
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Negative Analysis */}
      {negativeAnalysis && (
        <div className="card negative-card">
          <div className="flex items-center mb-6">
            <TrendingDown className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-2xl font-semibold text-red-700">Improvement Areas</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-700">Top Issues</h3>
              <ul className="space-y-2">
                {negativeAnalysis.topIssues?.map((issue, index) => (
                  <li key={index} className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-700">Critical Problems</h3>
              <ul className="space-y-2">
                {negativeAnalysis.criticalProblems?.map((problem, index) => (
                  <li key={index} className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    {problem}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-red-700">Suggested Improvements</h3>
            <div className="space-y-4">
              {negativeAnalysis.suggestedImprovements?.map((improvement, index) => (
                <div key={index} className="border border-red-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-700">{improvement.issue}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      improvement.priority === 'High' ? 'bg-red-100 text-red-800' :
                      improvement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {improvement.priority} Priority
                    </span>
                  </div>
                  <p className="text-gray-700">{improvement.improvement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis; 