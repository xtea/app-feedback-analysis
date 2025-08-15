const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const db = require('./db');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model selection (default to GPT-4)
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// Helper function to limit review text size
function limitReviewText(reviews, maxChars = 8000) {
  let text = '';
  for (const review of reviews) {
    const reviewText = `Rating: ${review.rating}/5\nTitle: ${review.title}\nContent: ${review.content}\n\n`;
    if (text.length + reviewText.length > maxChars) {
      break;
    }
    text += reviewText;
  }
  return text;
}

// Analyze reviews using LLM
async function analyzeReviews(reviews, appId, storeType, progressCallback = null) {
  try {
    console.log(`Analyzing ${reviews.length} reviews for app ${appId} from ${storeType}`);
    
    // Separate positive and negative reviews
    const positiveReviews = reviews.filter(review => review.sentiment === 'positive');
    const negativeReviews = reviews.filter(review => review.sentiment === 'negative');
    const neutralReviews = reviews.filter(review => review.sentiment === 'neutral');
    
    console.log(`Found ${positiveReviews.length} positive, ${negativeReviews.length} negative, ${neutralReviews.length} neutral reviews`);
    
    // Calculate analysis steps for better progress tracking
    const hasPositive = positiveReviews.length > 0;
    const hasNegative = negativeReviews.length > 0;
    const totalSteps = (hasPositive ? 1 : 0) + (hasNegative ? 1 : 0) + 1; // +1 for summary
    let currentStep = 0;
    
    // Helper to update progress with sub-step granularity
    const updateProgress = (message, subProgress = 0) => {
      if (progressCallback) {
        // Base progress from completed steps + current step sub-progress
        const baseProgress = currentStep / totalSteps;
        const stepProgress = subProgress / totalSteps;
        const progress = Math.floor(60 + (baseProgress + stepProgress) * 30); // 60-90% range
        progressCallback(Math.min(progress, 89), message); // Cap at 89% until final completion
      }
    };
    
    // Analyze positive reviews for features and user experiences
    let positiveAnalysis = null;
    if (hasPositive) {
      updateProgress('Analyzing positive feedback...', 0.1);
      console.log('Analyzing positive reviews...');
      positiveAnalysis = await analyzePositiveReviews(positiveReviews, (msg, subProg = 0.5) => updateProgress(msg, subProg));
      console.log('Positive analysis completed');
      currentStep++;
    }
    
    // Analyze negative reviews for issues and improvements
    let negativeAnalysis = null;
    if (hasNegative) {
      updateProgress('Analyzing negative feedback and issues...', 0.1);
      console.log('Analyzing negative reviews...');
      negativeAnalysis = await analyzeNegativeReviews(negativeReviews, (msg, subProg = 0.5) => updateProgress(msg, subProg));
      console.log('Negative analysis completed');
      currentStep++;
    }
    
    // Create summary statistics
    updateProgress('Generating summary statistics...', 0.1);
    const summary = {
      totalReviews: reviews.length,
      positiveCount: positiveReviews.length,
      negativeCount: negativeReviews.length,
      neutralCount: neutralReviews.length,
      averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
      positivePercentage: (positiveReviews.length / reviews.length) * 100,
      negativePercentage: (negativeReviews.length / reviews.length) * 100
    };
    currentStep++;
    
    const analysis = {
      appId,
      storeType,
      summary,
      positiveAnalysis,
      negativeAnalysis,
      timestamp: new Date().toISOString()
    };
    
    // Save analysis to database (upsert)
    const upsert = db.prepare(`
      INSERT INTO analyses (app_id, store, summary_json, positive_json, negative_json, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(app_id, store) DO UPDATE SET
        summary_json=excluded.summary_json,
        positive_json=excluded.positive_json,
        negative_json=excluded.negative_json,
        timestamp=excluded.timestamp
    `);
    upsert.run(
      appId,
      storeType,
      JSON.stringify(summary),
      positiveAnalysis ? JSON.stringify(positiveAnalysis) : null,
      negativeAnalysis ? JSON.stringify(negativeAnalysis) : null,
      analysis.timestamp
    );
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    throw error;
  }
}

// Analyze positive reviews to extract features and user experiences
async function analyzePositiveReviews(reviews, progressCallback = null) {
  try {
    console.log(`[POSITIVE ANALYSIS] Starting analysis of ${reviews.length} positive reviews`);
    if (progressCallback) progressCallback('Preparing positive reviews for analysis...', 0.1);
    
    const reviewsText = limitReviewText(reviews, 8000);
    console.log(`[POSITIVE ANALYSIS] Prepared ${reviewsText.length} characters of review text`);
    
    const prompt = `Analyze the following positive app reviews and extract:
1. Key features and functionalities that users love
2. Positive user experiences and satisfaction points
3. What makes the app stand out positively

Reviews:
${reviewsText}

Please provide a structured analysis with:
- Top 5 most mentioned features that is functional and useful
- Key positive user experiences
- What users appreciate most about the app
- Suggestions for highlighting these strengths

Format the response as JSON with the following structure:
{
  "topFeatures": ["feature1", "feature2", ...],
  "positiveExperiences": ["experience1", "experience2", ...],
  "userAppreciation": ["point1", "point2", ...],
  "strengthHighlights": ["highlight1", "highlight2", ...]
}`;

    console.log(`[POSITIVE ANALYSIS] Sending request to OpenAI (model: ${OPENAI_MODEL})...`);
    
    // Start progress simulation during OpenAI API call
    let progressSim = 0.3;
    const progressInterval = progressCallback ? setInterval(() => {
      progressSim = Math.min(progressSim + 0.05, 0.85); // Gradually increase to 85% of step
      progressCallback('Processing positive feedback with AI...', progressSim);
    }, 1000) : null; // Update every 1 second
    
    let response;
    try {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
      });

      // Clear the progress simulation
      if (progressInterval) clearInterval(progressInterval);
      
      response = completion.choices[0].message.content;
      console.log('[POSITIVE ANALYSIS] Received response from OpenAI, parsing JSON...');
      if (progressCallback) progressCallback('Completed positive feedback analysis', 0.9);
      
      const parsedResponse = JSON.parse(response);
      console.log('[POSITIVE ANALYSIS] Successfully completed analysis');
      return parsedResponse;
    } catch (error) {
      // Clear the progress simulation on error
      if (progressInterval) clearInterval(progressInterval);
      throw error;
    }
  } catch (error) {
    console.error('[POSITIVE ANALYSIS] Error analyzing positive reviews:', error);
    return {
      topFeatures: [],
      positiveExperiences: [],
      userAppreciation: [],
      strengthHighlights: []
    };
  }
}

// Analyze negative reviews to extract issues and improvements
async function analyzeNegativeReviews(reviews, progressCallback = null) {
  try {
    console.log(`[NEGATIVE ANALYSIS] Starting analysis of ${reviews.length} negative reviews`);
    if (progressCallback) progressCallback('Preparing negative reviews for analysis...', 0.1);
    
    const reviewsText = limitReviewText(reviews, 8000);
    console.log(`[NEGATIVE ANALYSIS] Prepared ${reviewsText.length} characters of review text`);
    
    const prompt = `Analyze the following negative app reviews and extract:
1. Main issues and problems users are facing
2. Specific areas that need improvement
3. Common complaints and pain points
4. Suggested improvements and solutions

Reviews:
${reviewsText}

Please provide a structured analysis with:
- Top 5 most common issues
- Critical problems that need immediate attention
- Suggested improvements for each major issue
- Priority levels for fixes (High/Medium/Low)

Format the response as JSON with the following structure:
{
  "topIssues": ["issue1", "issue2", ...],
  "criticalProblems": ["problem1", "problem2", ...],
  "suggestedImprovements": [
    {
      "issue": "issue description",
      "improvement": "suggested solution",
      "priority": "High/Medium/Low"
    }
  ],
  "priorityActions": ["action1", "action2", ...]
}`;

    console.log(`[NEGATIVE ANALYSIS] Sending request to OpenAI (model: ${OPENAI_MODEL})...`);
    
    // Start progress simulation during OpenAI API call
    let progressSim = 0.3;
    const progressInterval = progressCallback ? setInterval(() => {
      progressSim = Math.min(progressSim + 0.05, 0.85); // Gradually increase to 85% of step
      progressCallback('Processing negative feedback with AI...', progressSim);
    }, 1000) : null; // Update every 1 second
    
    let response;
    try {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
      });

      // Clear the progress simulation
      if (progressInterval) clearInterval(progressInterval);
      
      response = completion.choices[0].message.content;
      console.log('[NEGATIVE ANALYSIS] Received response from OpenAI, parsing JSON...');
      if (progressCallback) progressCallback('Completed negative feedback analysis', 0.9);
      
      const parsedResponse = JSON.parse(response);
      console.log('[NEGATIVE ANALYSIS] Successfully completed analysis');
      return parsedResponse;
    } catch (error) {
      // Clear the progress simulation on error
      if (progressInterval) clearInterval(progressInterval);
      throw error;
    }
  } catch (error) {
    console.error('[NEGATIVE ANALYSIS] Error analyzing negative reviews:', error);
    return {
      topIssues: [],
      criticalProblems: [],
      suggestedImprovements: [],
      priorityActions: []
    };
  }
}

module.exports = {
  analyzeReviews
}; 