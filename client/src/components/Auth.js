import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state && location.state.redirectTo) || '/';
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) navigate(redirectTo);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, [navigate, redirectTo]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        trackEvent('signup_submit');
        // Sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for the confirmation link!');
          setIsSignUp(false);
        }
      } else {
        trackEvent('login_submit');
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          navigate(redirectTo);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">


        {/* Auth Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {isSignUp ? 'Transform your app with AI-powered review insights' : 'Sign in to continue your analysis'}
            </p>
          </div>
          <form onSubmit={handleAuth} className="space-y-5 sm:space-y-6">
            {/* Email Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-sm sm:text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-sm sm:text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-sm sm:text-base"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <Mail className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-green-700">{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 sm:py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
              ) : null}
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


