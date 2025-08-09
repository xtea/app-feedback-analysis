const express = require('express');
const router = express.Router();
const { analyzeReviews } = require('../services/analysisService');
const db = require('../services/db');

// Analyze reviews using LLM
router.post('/analyze', async (req, res) => {
  // Set a longer timeout for this route
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  
  try {
    console.log('Received analyze request');
    console.log('Request body size:', JSON.stringify(req.body).length, 'characters');
    
    const { reviews, appId, storeType } = req.body;
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: 'Reviews array is required' });
    }

    console.log(`Processing ${reviews.length} reviews for app ${appId} from ${storeType}`);
    
    const analysis = await analyzeReviews(reviews, appId, storeType);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    res.status(500).json({ error: 'Failed to analyze reviews', details: error.message });
  }
});

// Get analysis summary
router.get('/summary/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const row = db.prepare('SELECT summary_json, positive_json, negative_json, store, timestamp FROM analyses WHERE app_id = ? LIMIT 1').get(appId);
    if (!row) return res.status(404).json({ error: 'Analysis not found' });
    const summary = JSON.parse(row.summary_json);
    const positiveAnalysis = row.positive_json ? JSON.parse(row.positive_json) : null;
    const negativeAnalysis = row.negative_json ? JSON.parse(row.negative_json) : null;
    res.json({ success: true, data: { appId, storeType: row.store, summary, positiveAnalysis, negativeAnalysis, timestamp: row.timestamp } });
  } catch (error) {
    console.error('Error fetching analysis summary:', error);
    res.status(500).json({ error: 'Failed to fetch analysis summary' });
  }
});

module.exports = router; 