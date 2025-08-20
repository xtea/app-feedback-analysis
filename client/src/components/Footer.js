import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-3 sm:px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            © {year} AppReview.ai. All rights reserved.
          </div>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <Link to="/privacy" className="hover:text-gray-900 underline">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-900 underline">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


