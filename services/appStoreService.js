const appStoreScraper = require('app-store-scraper');
const gplayModule = require('google-play-scraper');
const gplay = gplayModule.default || gplayModule; // Handle both CommonJS and ES module exports
const fs = require('fs-extra');
const path = require('path');
const db = require('./db');

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

    // Persist to database
    const insert = db.prepare(`INSERT INTO reviews (app_id, store, rating, title, content, author, date, sentiment) VALUES (?, 'apple', ?, ?, ?, ?, ?, ?)`);
    const transaction = db.transaction((rows) => {
      for (const r of rows) {
        insert.run(appId, r.rating, r.title, r.content, r.author, r.date, r.sentiment);
      }
    });
    transaction(transformedReviews);
    
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
    
    const reviewsResponse = await gplay.reviews({
      appId: appId,
      country: country,
      sort: gplay.sort.NEWEST,
      num: limit
    });

    console.log('Google Play reviews response type:', typeof reviewsResponse);
    console.log('Google Play reviews response keys:', Object.keys(reviewsResponse));
    
    // The response might be an object with a data property containing the reviews array
    const reviews = reviewsResponse.data || reviewsResponse.reviews || reviewsResponse;
    
    if (!Array.isArray(reviews)) {
      console.error('Reviews is not an array:', reviews);
      throw new Error('Invalid response format from Google Play Store API');
    }

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

    // Persist to database
    const insert = db.prepare(`INSERT INTO reviews (app_id, store, rating, title, content, author, date, sentiment) VALUES (?, 'google', ?, ?, ?, ?, ?, ?)`);
    const transaction = db.transaction((rows) => {
      for (const r of rows) {
        insert.run(appId, r.rating, r.title, r.content, r.author, r.date, r.sentiment);
      }
    });
    transaction(transformedReviews);
    
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

// --------------------
// Paginated fetchers
// --------------------

/**
 * Fetch Apple App Store reviews page-by-page.
 * Options:
 * - country: default 'us'
 * - startPage: default 1
 * - maxPages: default 5
 * - perPageSave: boolean to save each page to /data
 * - progressCallback: function to call with progress updates
 */
async function fetchAppStoreReviewsPaginated(appId, options = {}) {
  const country = options.country || 'us';
  const startPage = options.startPage || 1;
  const maxPages = 10;
  const perPageSave = options.perPageSave ?? true;
  const progressCallback = options.progressCallback;

  const dataDir = path.join(__dirname, '../data');
  await fs.ensureDir(dataDir);

  const all = [];
  let pagesFetched = 0;
  const totalPages = maxPages;
  
  for (let page = startPage; page < startPage + maxPages; page += 1) {
    console.log(`[APPLE PAGINATED] Fetching page ${page} for app ${appId}`);
    
    // Update progress before fetching each page
    if (progressCallback) {
      const progress = Math.floor(20 + (pagesFetched / totalPages) * 35); // 20-55% range
      progressCallback(progress, `Fetching Apple App Store reviews (page ${pagesFetched + 1}/${totalPages})...`);
    }
    
    // app-store-scraper returns ~50 reviews per page
    const pageReviews = await appStoreScraper.reviews({
      id: appId,
      country,
      sort: appStoreScraper.sort.RECENT,
      page,
    });
    
    pagesFetched++;
    
    if (!Array.isArray(pageReviews) || pageReviews.length === 0) {
      console.log(`[APPLE PAGINATED] No more reviews at page ${page}`);
      break;
    }
    
    const transformed = pageReviews.map(review => ({
      rating: review.score,
      title: review.title || '',
      content: review.text,
      author: review.userName,
      date: review.date,
      sentiment: review.score >= 4 ? 'positive' : review.score <= 2 ? 'negative' : 'neutral'
    }));
    
    if (perPageSave) {
      await fs.writeJson(path.join(dataDir, `${appId}_apple_reviews_page_${page}.json`), transformed, { spaces: 2 });
    }
    all.push(...transformed);
    
    // Update progress after processing each page
    if (progressCallback) {
      const progress = Math.floor(20 + (pagesFetched / totalPages) * 35);
      progressCallback(progress, `Fetched ${all.length} Apple App Store reviews so far...`);
    }
  }
  
  console.log(`[APPLE PAGINATED] Total accumulated reviews: ${all.length}`);
  await fs.writeJson(path.join(dataDir, `${appId}_apple_reviews_all.json`), all, { spaces: 2 });
  
  // Save to database  
  if (all.length > 0) {
    const insert = db.prepare(`INSERT INTO reviews (app_id, store, rating, title, content, author, date, sentiment) VALUES (?, 'apple', ?, ?, ?, ?, ?, ?)`);
    const transaction = db.transaction((rows) => {
      for (const r of rows) {
        insert.run(appId, r.rating, r.title, r.content, r.author, r.date, r.sentiment);
      }
    });
    transaction(all);
  }
  
  return all;
}

/**
 * Fetch Google Play reviews page-by-page.
 * Options:
 * - country: default 'us'
 * - pageSize: number of reviews per page (num). Default 100
 * - maxPages: default 5
 * - perPageSave: boolean to save each page to /data
 * - progressCallback: function to call with progress updates
 */
async function fetchGooglePlayReviewsPaginated(appId, options = {}) {
  const country = options.country || 'us';
  const pageSize = options.pageSize || 100;
  const maxPages = options.maxPages || 100;
  const perPageSave = options.perPageSave ?? true;
  const progressCallback = options.progressCallback;

  const dataDir = path.join(__dirname, '../data');
  await fs.ensureDir(dataDir);

  const all = [];
  let nextPaginationToken = undefined;
  let pagesFetched = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    console.log(`[GOOGLE PAGINATED] Fetching page ${page} for app ${appId}`);
    
    // Update progress before fetching each page
    if (progressCallback) {
      const progress = Math.floor(20 + (pagesFetched / maxPages) * 35); // 20-55% range
      progressCallback(progress, `Fetching Google Play reviews (page ${pagesFetched + 1}/${maxPages})...`);
    }
    
    const opts = {
      appId,
      country,
      sort: gplay.sort.NEWEST,
      num: pageSize,
    };
    if (nextPaginationToken) {
      // google-play-scraper v10 uses nextPaginationToken to continue
      opts.nextPaginationToken = nextPaginationToken;
    }

    const response = await gplay.reviews(opts);
    pagesFetched++;
    
    // Response may be an object { data, nextPaginationToken }
    const pageReviews = response.data || response.reviews || response;
    if (!Array.isArray(pageReviews) || pageReviews.length === 0) {
      console.log(`[GOOGLE PAGINATED] No more reviews at page ${page}`);
      break;
    }
    
    const transformed = pageReviews.map(review => ({
      rating: review.score,
      title: review.title || '',
      content: review.text,
      author: review.userName,
      date: review.date,
      sentiment: review.score >= 4 ? 'positive' : review.score <= 2 ? 'negative' : 'neutral'
    }));
    
    if (perPageSave) {
      await fs.writeJson(path.join(dataDir, `${appId}_google_reviews_page_${page}.json`), transformed, { spaces: 2 });
    }
    all.push(...transformed);

    // Update progress after processing each page
    if (progressCallback) {
      const progress = Math.floor(20 + (pagesFetched / maxPages) * 35);
      progressCallback(progress, `Fetched ${all.length} Google Play reviews so far...`);
    }

    nextPaginationToken = response.nextPaginationToken;
    if (!nextPaginationToken) {
      console.log('[GOOGLE PAGINATED] No nextPaginationToken, stopping');
      break;
    }
  }

  console.log(`[GOOGLE PAGINATED] Total accumulated reviews: ${all.length}`);
  await fs.writeJson(path.join(dataDir, `${appId}_google_reviews_all.json`), all, { spaces: 2 });
  
  // Save to database
  if (all.length > 0) {
    const insert = db.prepare(`INSERT INTO reviews (app_id, store, rating, title, content, author, date, sentiment) VALUES (?, 'google', ?, ?, ?, ?, ?, ?)`);
    const transaction = db.transaction((rows) => {
      for (const r of rows) {
        insert.run(appId, r.rating, r.title, r.content, r.author, r.date, r.sentiment);
      }
    });
    transaction(all);
  }
  
  return all;
}

module.exports.fetchAppStoreReviewsPaginated = fetchAppStoreReviewsPaginated;
module.exports.fetchGooglePlayReviewsPaginated = fetchGooglePlayReviewsPaginated;