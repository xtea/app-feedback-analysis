const express = require('express');
const router = express.Router();
const { fetchAppStoreReviews, fetchGooglePlayReviews, getAppleAppInfo, getGooglePlayAppInfo } = require('../services/appStoreService');

// Fetch reviews from Apple App Store
router.post('/fetch-apple', async (req, res) => {
  try {
    const { appId, country = 'us', limit = 100 } = req.body;
    
    if (!appId) {
      return res.status(400).json({ error: 'App ID is required' });
    }

    const reviews = await fetchAppStoreReviews(appId, country, limit);
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching Apple App Store reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Fetch reviews from Google Play Store
router.post('/fetch-google', async (req, res) => {
  try {
    const { appId, country = 'us', limit = 100 } = req.body;
    
    if (!appId) {
      return res.status(400).json({ error: 'App ID is required' });
    }

    const reviews = await fetchGooglePlayReviews(appId, country, limit);
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching Google Play Store reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get Apple App Store app information
router.get('/apple-app/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const { country = 'us' } = req.query;
    
    if (!appId) {
      return res.status(400).json({ error: 'App ID is required' });
    }

    const appInfo = await getAppleAppInfo(appId, country);
    res.json({ success: true, data: appInfo });
  } catch (error) {
    console.error('Error fetching Apple App Store app info:', error);
    res.status(500).json({ error: 'Failed to fetch app info' });
  }
});

// Get Google Play Store app information
router.get('/google-app/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const { country = 'us' } = req.query;
    
    if (!appId) {
      return res.status(400).json({ error: 'App ID is required' });
    }

    const appInfo = await getGooglePlayAppInfo(appId, country);
    res.json({ success: true, data: appInfo });
  } catch (error) {
    console.error('Error fetching Google Play Store app info:', error);
    res.status(500).json({ error: 'Failed to fetch app info' });
  }
});

module.exports = router; 