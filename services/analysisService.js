const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
async function analyzeReviews(reviews, appId, storeType) {
  try {
    console.log(`Analyzing ${reviews.length} reviews for app ${appId} from ${storeType}`);
    
    // Separate positive and negative reviews
    const positiveReviews = reviews.filter(review => review.sentiment === 'positive');
    const negativeReviews = reviews.filter(review => review.sentiment === 'negative');
    const neutralReviews = reviews.filter(review => review.sentiment === 'neutral');
    
    console.log(`Found ${positiveReviews.length} positive, ${negativeReviews.length} negative, ${neutralReviews.length} neutral reviews`);
    
    // Analyze positive reviews for features and user experiences
    let positiveAnalysis = null;
    if (positiveReviews.length > 0) {
      console.log('Analyzing positive reviews...');
      positiveAnalysis = await analyzePositiveReviews(positiveReviews);
      console.log('Positive analysis completed');
    }
    
    // Analyze negative reviews for issues and improvements
    let negativeAnalysis = null;
    if (negativeReviews.length > 0) {
      console.log('Analyzing negative reviews...');
      negativeAnalysis = await analyzeNegativeReviews(negativeReviews);
      console.log('Negative analysis completed');
    }
    
    // Create summary statistics
    const summary = {
      totalReviews: reviews.length,
      positiveCount: positiveReviews.length,
      negativeCount: negativeReviews.length,
      neutralCount: neutralReviews.length,
      averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
      positivePercentage: (positiveReviews.length / reviews.length) * 100,
      negativePercentage: (negativeReviews.length / reviews.length) * 100
    };
    
    const analysis = {
      appId,
      storeType,
      summary,
      positiveAnalysis,
      negativeAnalysis,
      timestamp: new Date().toISOString()
    };
    
    // Save analysis to file
    const dataDir = path.join(__dirname, '../data');
    await fs.ensureDir(dataDir);
    await fs.writeJson(path.join(dataDir, `${appId}_analysis.json`), analysis, { spaces: 2 });
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    throw error;
  }
}

// Analyze positive reviews to extract features and user experiences
async function analyzePositiveReviews(reviews) {
  try {
    const reviewsText = limitReviewText(reviews, 8000);
    
    const prompt = `Analyze the following positive app reviews and extract:
1. Key features and functionalities that users love
2. Positive user experiences and satisfaction points
3. What makes the app stand out positively

Reviews:
${reviewsText}

Please provide a structured analysis with:
- Top 5 most mentioned features
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

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing positive reviews:', error);
    return {
      topFeatures: [],
      positiveExperiences: [],
      userAppreciation: [],
      strengthHighlights: []
    };
  }
}

// Analyze negative reviews to extract issues and improvements
async function analyzeNegativeReviews(reviews) {
  try {
    const reviewsText = limitReviewText(reviews, 8000);
    
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

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing negative reviews:', error);
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