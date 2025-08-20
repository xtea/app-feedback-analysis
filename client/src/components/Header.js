import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Home, LogOut, LogIn, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUserEmail(data?.session?.user?.email || null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleLogout = async () => {
    try {
      trackEvent('logout');
      await supabase.auth.signOut();
      navigate('/login');
    } catch (_) {}
  };
  return (
    <header className="bg-white shadow-sm border-b">
      <Helmet>
        <meta name="author" content="AppReview.ai" />
        <meta name="application-name" content="AppReview.ai" />
      </Helmet>
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
                <BarChart3 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="hidden xs:inline text-lg sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                AppReview.ai
              </span>
              <span className="xs:hidden text-sm font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AppReview
              </span>
              <span className="hidden xs:inline text-xs text-gray-500 font-medium -mt-1 tracking-wide">
                AI-Powered Review Insights
              </span>
            </div>
          </Link>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/" className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors p-2 sm:p-1">
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            {userEmail ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  <User className="w-4 h-4 mr-1 sm:mr-1.5 text-gray-500" />
                  <span className="text-xs sm:text-sm font-medium truncate max-w-20 sm:max-w-none">{userEmail.split('@')[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors min-w-0"
                >
                  <LogOut className="w-4 h-4 mr-0 sm:mr-1.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { trackEvent('login_click'); navigate('/login', { state: { redirectTo: location.pathname + location.search } }); }}
                className="inline-flex items-center px-2 sm:px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-900 transition-colors min-w-0"
              >
                <LogIn className="w-4 h-4 mr-0 sm:mr-1.5" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 