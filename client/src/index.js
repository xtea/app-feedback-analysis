import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';
import { supabase } from './lib/supabase';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 

// Attach Authorization header from Supabase session
(async () => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  supabase.auth.onAuthStateChange((_event, session) => {
    const t = session?.access_token;
    if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    else delete axios.defaults.headers.common['Authorization'];
  });
})();