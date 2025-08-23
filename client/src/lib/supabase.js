import { createClient } from '@supabase/supabase-js';

// Create React App environment variables (preferred)
const supabaseUrl = (window.__ENV && window.__ENV.REACT_APP_SUPABASE_URL) || process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnon = (window.__ENV && window.__ENV.REACT_APP_SUPABASE_ANON_KEY) || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:', {
  hasUrl: !!supabaseUrl,
  urlDomain: supabaseUrl ? new URL(supabaseUrl).hostname : 'missing',
  hasAnonKey: !!supabaseAnon,
  anonKeyLength: supabaseAnon ? supabaseAnon.length : 0,
  anonKeyPrefix: supabaseAnon ? supabaseAnon.substring(0, 20) + '...' : 'missing',
  timestamp: new Date().toISOString()
});

if (!supabaseUrl || !supabaseAnon) {
  console.error('❌ Supabase configuration missing:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnon: !!supabaseAnon,
    env: process.env,
    windowEnv: window.__ENV
  });
  // For CRA, set these in client/.env and restart npm start
  // REACT_APP_SUPABASE_URL=...
  // REACT_APP_SUPABASE_ANON_KEY=...
  throw new Error('Supabase configuration missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in client/.env');
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    debug: true, // Enable Supabase auth debugging
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase client created successfully:', {
  url: supabaseUrl,
  hasRealtime: !!supabase.realtime,
  hasAuth: !!supabase.auth,
  timestamp: new Date().toISOString()
});


