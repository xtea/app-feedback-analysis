import { createClient } from '@supabase/supabase-js';

// Create React App environment variables (preferred)
const supabaseUrl = (window.__ENV && window.__ENV.REACT_APP_SUPABASE_URL) || process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnon = (window.__ENV && window.__ENV.REACT_APP_SUPABASE_ANON_KEY) || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  // For CRA, set these in client/.env and restart npm start
  // REACT_APP_SUPABASE_URL=...
  // REACT_APP_SUPABASE_ANON_KEY=...
  throw new Error('Supabase configuration missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in client/.env');
}

export const supabase = createClient(supabaseUrl, supabaseAnon);


