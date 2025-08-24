// Enhanced logging utility for debugging
export const logger = {
  // Auth-related logging
  auth: {
    signup: (action, data) => {
      console.log(`🔐 Auth Signup [${action}]:`, {
        ...data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    },
    
    login: (action, data) => {
      console.log(`🔑 Auth Login [${action}]:`, {
        ...data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    },
    
    passwordReset: (action, data) => {
      console.log(`🔄 Auth Password Reset [${action}]:`, {
        ...data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    },
    
    error: (error, context = {}) => {
      console.error('❌ Auth Error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        supabaseError: error,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        localStorage: {
          hasSupabaseSession: !!localStorage.getItem('supabase.auth.token'),
          localStorageKeys: Object.keys(localStorage).filter(k => k.includes('supabase'))
        }
      });
    }
  },
  
  // Network monitoring
  network: {
    request: (url, options) => {
      console.log('📡 Network Request:', {
        url,
        method: options?.method || 'GET',
        headers: options?.headers,
        timestamp: new Date().toISOString(),
        online: navigator.onLine
      });
    },
    
    response: (url, response, duration) => {
      console.log('📥 Network Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    },
    
    error: (url, error, duration) => {
      console.error('💥 Network Error:', {
        url,
        error: error.message,
        duration: duration ? `${duration}ms` : 'unknown',
        timestamp: new Date().toISOString(),
        online: navigator.onLine
      });
    }
  },
  
  // Database/Supabase specific logging
  supabase: {
    operation: (operation, table, data) => {
      console.log(`🗄️ Supabase [${operation}] on ${table}:`, {
        data,
        timestamp: new Date().toISOString()
      });
    },
    
    error: (operation, error, context = {}) => {
      console.error(`❌ Supabase Error [${operation}]:`, {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code,
        status: error.status,
        context,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Environment debugging
  env: {
    check: () => {
      console.log('🌍 Environment Check:', {
        NODE_ENV: process.env.NODE_ENV,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        location: window.location.href,
        localStorage: Object.keys(localStorage).length,
        sessionStorage: Object.keys(sessionStorage).length,
        cookiesEnabled: navigator.cookieEnabled,
        language: navigator.language,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Network monitoring wrapper for fetch
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [url] = args;
  const startTime = Date.now();
  
  try {
    logger.network.request(url, args[1]);
    const response = await originalFetch(...args);
    const duration = Date.now() - startTime;
    logger.network.response(url, response, duration);
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.network.error(url, error, duration);
    throw error;
  }
};

// Add online/offline monitoring
window.addEventListener('online', () => {
  console.log('🌐 Network: ONLINE');
});

window.addEventListener('offline', () => {
  console.log('📴 Network: OFFLINE');
});

// Log environment on load
logger.env.check();

export default logger;
