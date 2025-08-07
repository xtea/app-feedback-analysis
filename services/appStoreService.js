const appStoreScraper = require('app-store-scraper');
const gplay = require('google-play-scraper');
const fs = require('fs-extra');
const path = require('path');

// Fetch reviews from Apple App Store
async function fetchAppStoreReviews(appId, country = 'us', limit = 100) {
  try {
    console.log(`Fetching Apple App Store reviews for app ID: ${appId}`);
    
    const reviews = await appStoreScraper.reviews({
      id: appId,
      country: country,
      sort: appStoreScraper.sort.RECENT,
      num: limit
    });

    // Transform the reviews to match our expected format
    const transformedReviews = reviews.map(review => ({
      rating: review.score,
      title: review.title || '',
      content: review.text,
      author: review.userName,
      date: review.date,
      sentiment: review.score >= 4 ? 'positive' : review.score <= 2 ? 'negative' : 'neutral'
    }));

    console.log(`Successfully fetched ${transformedReviews.length} Apple App Store reviews`);

    // Save to local file
    const dataDir = path.join(__dirname, '../data');
    await fs.ensureDir(dataDir);
    await fs.writeJson(path.join(dataDir, `${appId}_apple_reviews.json`), transformedReviews);
    
    return transformedReviews;
  } catch (error) {
    console.error('Error fetching Apple App Store reviews:', error);
    throw error;
  }
}

// Fetch reviews from Google Play Store
async function fetchGooglePlayReviews(appId, country = 'us', limit = 100) {
  try {
    console.log(`Fetching Google Play Store reviews for app ID: ${appId}`);
    
    const reviews = await gplay.reviews({
      appId: appId,
      country: country,
      sort: gplay.sort.NEWEST,
      num: limit
    });

    // Transform the reviews to match our expected format
    const transformedReviews = reviews.map(review => ({
      rating: review.score,
      title: review.title || '',
      content: review.text,
      author: review.userName,
      date: review.date,
      sentiment: review.score >= 4 ? 'positive' : review.score <= 2 ? 'negative' : 'neutral'
    }));

    console.log(`Successfully fetched ${transformedReviews.length} Google Play Store reviews`);

    // Save to local file
    const dataDir = path.join(__dirname, '../data');
    await fs.ensureDir(dataDir);
    await fs.writeJson(path.join(dataDir, `${appId}_google_reviews.json`), transformedReviews);
    
    return transformedReviews;
  } catch (error) {
    console.error('Error fetching Google Play Store reviews:', error);
    throw error;
  }
}

// Get app information from Apple App Store
async function getAppleAppInfo(appId, country = 'us') {
  try {
    const appInfo = await appStoreScraper.app({
      id: appId,
      country: country
    });
    
    return appInfo;
  } catch (error) {
    console.error('Error fetching Apple App Store app info:', error);
    throw error;
  }
}

// Get app information from Google Play Store
async function getGooglePlayAppInfo(appId, country = 'us') {
  try {
    const appInfo = await gplay.app({
      appId: appId,
      country: country
    });
    
    return appInfo;
  } catch (error) {
    console.error('Error fetching Google Play Store app info:', error);
    throw error;
  }
}

module.exports = {
  fetchAppStoreReviews,
  fetchGooglePlayReviews,
  getAppleAppInfo,
  getGooglePlayAppInfo
}; 