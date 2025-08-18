// Analytics wrapper: prefer pushing to dataLayer (GTM), fallback to gtag

const safePushToDataLayer = (obj) => {
  try {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(obj);
    }
  } catch (_) {}
};

export const trackEvent = (eventName, params = {}) => {
  // Send to GTM dataLayer
  safePushToDataLayer({ event: eventName, ...params });
  // Also try gtag if present (for direct GA setups)
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (_) {}
};

export const trackPageView = (path, title) => {
  // Standardize with 'page_view' event for GA4 via GTM
  safePushToDataLayer({
    event: 'page_view',
    page_path: path,
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
  });
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
      });
    }
  } catch (_) {}
};


