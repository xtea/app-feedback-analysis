import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Home from './components/Home';
import Analysis from './components/Analysis';
import Auth from './components/Auth';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/" element={<Home />} />
              <Route path="/analysis/:appId" element={<Analysis />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App; 