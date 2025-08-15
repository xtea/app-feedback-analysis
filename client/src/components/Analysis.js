import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Download,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaApple, FaAndroid } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const Analysis = () => {
  const { appId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appMeta, setAppMeta] = useState({ name: null, storeUrl: null });
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalysis();
  }, [appId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Watch Supabase auth state for gating the full report
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAuthed(!!data?.session?.user);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const response = await axios.get(`/api/analysis/summary/${appId}`);
      if (response.data.success) {
        setAnalysis(response.data.data);
        // fetch app meta (name/url) after we know storeType
        try {
          const storeType = response.data.data.storeType;
          let infoRes;
          if (storeType === 'apple') {
            infoRes = await axios.get(`/api/appstore/apple-app/${appId}?country=us`);
          } else {
            infoRes = await axios.get(`/api/appstore/google-app/${appId}?country=us`);
          }
          const info = infoRes?.data?.data || {};
          const name = info.title || info.trackName || info.name || null;
          const storeUrl = buildStoreUrl(storeType, appId, 'us');
          setAppMeta({ name, storeUrl });
        } catch (_) {
          setAppMeta({ name: null, storeUrl: buildStoreUrl(response.data.data.storeType, appId, 'us') });
        }
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

  const buildStoreUrl = (storeType, id, country='us') => {
    if (storeType === 'apple') {
      return `https://apps.apple.com/${country}/app/id${id}`;
    }
    return `https://play.google.com/store/apps/details?id=${id}&hl=en&gl=US`;
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

  // For unauthenticated users, show only the first positive and negative comments
  const visiblePositiveExperiences = (isAuthed ? positiveAnalysis?.positiveExperiences : positiveAnalysis?.positiveExperiences?.slice(0, 1)) || [];
  const visibleTopIssues = (isAuthed ? negativeAnalysis?.topIssues : negativeAnalysis?.topIssues?.slice(0, 1)) || [];

  // Rasterize inline SVGs (e.g., Recharts) to PNG <img> so html2canvas reliably captures charts
  const rasterizeSvgsForExport = async (container) => {
    const svgNodes = Array.from(container.querySelectorAll('svg'));
    const replacements = [];

    await Promise.all(
      svgNodes.map(async (svg) => {
        try {
          const rect = svg.getBoundingClientRect();
          const fallbackWidth = svg.viewBox?.baseVal?.width || parseInt(svg.getAttribute('width') || '0', 10) || 0;
          const fallbackHeight = svg.viewBox?.baseVal?.height || parseInt(svg.getAttribute('height') || '0', 10) || 0;
          const width = Math.ceil(rect.width || fallbackWidth);
          const height = Math.ceil(rect.height || fallbackHeight);
          if (!width || !height) return;

          const svgClone = svg.cloneNode(true);
          svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          svgClone.setAttribute('width', String(width));
          svgClone.setAttribute('height', String(height));

          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svgClone);
          const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

          const image = new Image();
          image.src = svgDataUri;
          await new Promise((resolve) => {
            image.onload = resolve;
            image.onerror = resolve; // continue even if an SVG fails
          });

          const deviceScale = Math.max(1, Math.floor(window.devicePixelRatio || 1));
          const offscreen = document.createElement('canvas');
          offscreen.width = width * deviceScale;
          offscreen.height = height * deviceScale;
          const ctx = offscreen.getContext('2d');
          ctx.scale(deviceScale, deviceScale);
          ctx.drawImage(image, 0, 0, width, height);

          const pngData = offscreen.toDataURL('image/png');
          const imgEl = new Image();
          imgEl.src = pngData;
          imgEl.style.width = `${width}px`;
          imgEl.style.height = `${height}px`;

          const parent = svg.parentNode;
          if (!parent) return;
          parent.replaceChild(imgEl, svg);
          replacements.push({ parent, imgEl, svg });
        } catch (_) {
          // Ignore individual SVG conversion failures and keep going
        }
      })
    );

    return () => {
      for (const { parent, imgEl, svg } of replacements) {
        try {
          parent.replaceChild(svg, imgEl);
        } catch (_) {
          // best-effort restore
        }
      }
    };
  };
  const handleExportPdf = async () => {
    const reportEl = document.getElementById('analysis-report');
    if (!reportEl) return;
    let revertSvgs = () => {};
    try {
      // Replace SVG charts with raster images for reliable capture
      revertSvgs = await rasterizeSvgsForExport(reportEl);

      // Higher scale for sharpness (closer to original), still controlled
      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Create compressed PDF
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const pageHeightMm = pdf.internal.pageSize.getHeight();
      const marginMm = 10;
      const contentWidthMm = pageWidthMm - marginMm * 2;
      const contentHeightMm = pageHeightMm - marginMm * 2;

      // We scale the image so canvas.width px == contentWidthMm
      const pxPerMm = canvas.width / contentWidthMm;
      const pageHeightPx = Math.floor(contentHeightMm * pxPerMm);

      let currentY = 0
      let pageIndex = 0;
      while (currentY < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - currentY);

        // Slice the canvas to the current page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;
        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );

        // JPEG with slightly higher quality to improve readability
        const imgData = pageCanvas.toDataURL('image/jpeg', 1);

        const sliceHeightMm = (sliceHeightPx / pxPerMm);
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', marginMm, marginMm, contentWidthMm, sliceHeightMm);

        currentY += sliceHeightPx;
        pageIndex += 1;
      }

      pdf.save(`analysis_${appId}.pdf`);
    } catch (e) {
      console.error('Failed to export PDF:', e);
    } finally {
      try { revertSvgs(); } catch (_) {}
    }
  };

  // Ensure total equals positive + negative per requirement (exclude neutral)
  const totalPosNeg = (summary?.positiveCount || 0) + (summary?.negativeCount || 0);
  const formatNumber = (n) => (typeof n === 'number' ? n.toLocaleString() : '0');

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
      <Helmet>
        <title>Analysis for {appId} | App Feedback Analysis</title>
        <meta name="description" content={`Insights, sentiment, top issues, and strengths for ${appId}`} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:title" content={`Analysis for ${appId}`} />
        <meta property="og:description" content="AI-powered analysis of app store reviews for actionable insights." />
      </Helmet>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  {analysis.storeType === 'apple' ? (
                    <FaApple className="w-6 h-6 text-black" />
                  ) : (
                    <FaAndroid className="w-6 h-6 text-green-600" />
                  )}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {appMeta.name || 'App'}
                  </h1>
                  {appMeta.storeUrl && (
                    <a
                      href={appMeta.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View on {analysis.storeType === 'apple' ? 'App Store' : 'Google Play'}
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  ID:&nbsp;
                  {appMeta.storeUrl ? (
                    <a
                      href={appMeta.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900 underline"
                    >
                      {appId}
                    </a>
                  ) : (
                    appId
                  )}
                  <span className="mx-2">•</span>
                  Analyzed {new Date(analysis.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-secondary flex items-center" onClick={isAuthed ? handleExportPdf : () => navigate('/login')}>
                <Download className="w-4 h-4 mr-2" />
                {isAuthed ? 'Export Report' : 'Login to Export'}
              </button>
              <Link to="/" className="btn-primary flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div id="analysis-report" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-xl">
        {/* Key Metrics Overview (always visible as preview) */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(totalPosNeg)}</p>
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

        {/* Charts Section (locked when not authenticated) */}
        <div className={(isAuthed ? '' : 'filter blur-sm md:blur pointer-events-none ') + 'grid lg:grid-cols-2 gap-8 mb-8'}>
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

        {/* Side-by-Side Comparison (partially visible when not authenticated) */}
        <div className={'grid lg:grid-cols-2 gap-8'}>
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
                    <div className={isAuthed ? 'space-y-3' : 'space-y-3 filter blur-[1px]'}>
                      {positiveAnalysis.topFeatures?.slice(0, isAuthed ? undefined : 1).map((feature, index) => (
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
                      {visiblePositiveExperiences.map((experience, index) => (
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
                    <div className={isAuthed ? 'space-y-3' : 'space-y-3 filter blur-[1px]'}>
                      {positiveAnalysis.strengthHighlights?.slice(0, isAuthed ? undefined : 1).map((highlight, index) => (
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
                      {visibleTopIssues.map((issue, index) => (
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
                    <div className={isAuthed ? 'space-y-3' : 'space-y-3 filter blur-[1px]'}>
                      {negativeAnalysis.criticalProblems?.slice(0, isAuthed ? undefined : 1).map((problem, index) => (
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
                    <div className={isAuthed ? 'space-y-4' : 'space-y-4 filter blur-[1px]'}>
                      {negativeAnalysis.suggestedImprovements?.slice(0, isAuthed ? undefined : 1).map((improvement, index) => (
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
      {!isAuthed && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="pointer-events-auto backdrop-blur-sm bg-white/70 border border-red-200 rounded-2xl shadow-lg p-6 max-w-md text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlock Full Report</h3>
            <p className="text-gray-700 mb-4">Sign in to view detailed charts and recommendations.</p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Unblock Content
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analysis;