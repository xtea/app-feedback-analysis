const { createClient } = require('@supabase/supabase-js');

// Backend Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase backend configuration missing:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey
  });
  throw new Error('Supabase backend configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

console.log('🔧 Backend Supabase Configuration Check:', {
  hasUrl: !!supabaseUrl,
  urlDomain: supabaseUrl ? new URL(supabaseUrl).hostname : 'missing',
  hasServiceKey: !!supabaseServiceKey,
  timestamp: new Date().toISOString()
});

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Backend Supabase client created successfully');

module.exports = { supabase };
