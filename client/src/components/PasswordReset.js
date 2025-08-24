import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { logger } from '../lib/logger';

export default function PasswordReset() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Debug: Log all URL parameters and fragments
      const currentUrl = window.location.href;
      const urlParams = Object.fromEntries(searchParams.entries());
      const urlFragment = window.location.hash;
      
      console.log('🔍 Password Reset Debug:', {
        fullUrl: currentUrl,
        queryParams: urlParams,
        fragment: urlFragment,
        search: window.location.search,
        hash: window.location.hash
      });

      // Let Supabase handle the session detection from URL
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔍 Supabase Session Check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasAccessToken: !!session?.access_token,
          sessionError: error?.message,
          userEmail: session?.user?.email
        });

        if (session?.user) {
          setValidToken(true);
          logger.auth.passwordReset('SESSION_VALIDATED', {
            userId: session.user.id,
            userEmail: session.user.email
          });
        } else {
          // Manual parameter parsing as fallback
          let accessToken = searchParams.get('access_token');
          let refreshToken = searchParams.get('refresh_token');
          let type = searchParams.get('type');

          // Check URL fragment if not in query params
          if (!accessToken && urlFragment) {
            const fragmentParams = new URLSearchParams(urlFragment.slice(1));
            accessToken = fragmentParams.get('access_token');
            refreshToken = fragmentParams.get('refresh_token');
            type = fragmentParams.get('type');
          }

          console.log('🔍 Manual token check:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            type,
            accessTokenLength: accessToken?.length
          });

          if (accessToken) {
            try {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              setValidToken(true);
              logger.auth.passwordReset('MANUAL_SESSION_SET', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken
              });
            } catch (sessionError) {
              logger.auth.error(sessionError, {
                operation: 'set_session_manual'
              });
              setError('Invalid or expired reset link. Please request a new password reset.');
            }
          } else {
            logger.auth.passwordReset('NO_TOKENS_FOUND', {
              allParams: urlParams,
              fragment: urlFragment,
              currentUrl
            });
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        }
      } catch (sessionError) {
        logger.auth.error(sessionError, {
          operation: 'get_session'
        });
        setError('Error checking authentication session.');
      }
    };

    checkSession();
  }, [searchParams]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Client-side validation
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

      logger.auth.passwordReset('UPDATE_STARTED', { 
        passwordLength: password.length 
      });
      trackEvent('password_update_submit');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        logger.auth.error(error, { 
          operation: 'password_update',
          passwordLength: password.length
        });
        setError(error.message);
      } else {
        logger.auth.passwordReset('UPDATE_SUCCESS', {});
        setSuccess(true);
        trackEvent('password_update_success');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      logger.auth.error(err, {
        operation: 'password_update_catch'
      });
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Password Updated!
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully updated. You will be redirected to the login page shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Set New Password
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Enter your new password below
            </p>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="space-y-5 sm:space-y-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
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
                  placeholder="Enter your new password"
                  minLength="6"
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

            {/* Confirm New Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
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
                  placeholder="Confirm your new password"
                  minLength="6"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
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
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
