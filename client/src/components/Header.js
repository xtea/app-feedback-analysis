import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Home, LogOut, LogIn, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Header = () => {
  const navigate = useNavigate();
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
      await supabase.auth.signOut();
      navigate('/login');
    } catch (_) {}
  };
  return (
    <header className="bg-white shadow-sm border-b">
      <Helmet>
        <meta name="author" content="App Feedback Analysis" />
        <meta name="application-name" content="App Feedback Analysis" />
      </Helmet>
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-base sm:text-xl font-bold text-gray-800 hover:text-gray-700 transition-colors">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <span className="hidden xs:inline sm:inline">App Feedback Analysis</span>
            <span className="xs:hidden text-sm">AFA</span>
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
                onClick={() => navigate('/login')}
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