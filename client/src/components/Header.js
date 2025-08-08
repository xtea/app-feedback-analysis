import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BarChart3, Home } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <Helmet>
        <meta name="author" content="App Feedback Analysis" />
        <meta name="application-name" content="App Feedback Analysis" />
      </Helmet>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <span>App Feedback Analysis</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 