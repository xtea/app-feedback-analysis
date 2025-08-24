import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Home from './components/Home';
import Analysis from './components/Analysis';
import Auth from './components/Auth';
import PurchaseCredits from './components/PurchaseCredits';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Footer from './components/Footer';
import './App.css';
import { useEffect } from 'react';
import { trackPageView } from './lib/analytics';

const RouteChangeTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname, document.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  return null;
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <RouteChangeTracker />
          <Header />
          <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/" element={<Home />} />
              <Route path="/analysis/:appId" element={<Analysis />} />
              <Route path="/purchase-credits" element={<PurchaseCredits />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App; 