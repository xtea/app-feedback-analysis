const express = require('express');
const router = express.Router();
const { analyzeReviews } = require('../services/analysisService');

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
    const fs = require('fs-extra');
    const path = require('path');
    
    const summaryPath = path.join(__dirname, '../data', `${appId}_analysis.json`);
    
    if (await fs.pathExists(summaryPath)) {
      const summary = await fs.readJson(summaryPath);
      res.json({ success: true, data: summary });
    } else {
      res.status(404).json({ error: 'Analysis not found' });
    }
  } catch (error) {
    console.error('Error fetching analysis summary:', error);
    res.status(500).json({ error: 'Failed to fetch analysis summary' });
  }
});

module.exports = router; 