const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const {
  fetchAppStoreReviews,
  fetchGooglePlayReviews,
  fetchAppStoreReviewsPaginated,
  fetchGooglePlayReviewsPaginated,
} = require('./appStoreService');
const { analyzeReviews } = require('./analysisService');

// In-memory job store (in production, use Redis or database)
const jobs = new Map();

// Job statuses
const JOB_STATUS = {
  PENDING: 'pending',
  FETCHING_REVIEWS: 'fetching_reviews',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Create a new analysis job
function createJob(appId, storeType = 'apple', options = {}) {
  const jobId = uuidv4();
  const job = {
    id: jobId,
    appId,
    storeType,
    status: JOB_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0,
    message: 'Job created',
    options: {
      country: options.country || 'us',
      // Single-shot fallback
      limit: options.limit || 100,
      // Pagination options
      usePagination: options.usePagination !== undefined ? options.usePagination : true,
      startPage: options.startPage || 1,
      // Default to a high page cap; clients don't need to pass this
      maxPages: options.maxPages ?? 100,
      pageSize: options.pageSize || 100, // Google specific size per page
      perPageSave: options.perPageSave !== undefined ? options.perPageSave : true,
      ...options,
    },
    result: null,
    error: null
  };
  
  jobs.set(jobId, job);
  console.log(`Created job ${jobId} for app ${appId} (${storeType})`);
  
  // Start processing asynchronously
  processJob(jobId).catch(error => {
    console.error(`Job ${jobId} failed:`, error);
    updateJobStatus(jobId, JOB_STATUS.FAILED, 0, `Processing failed: ${error.message}`, null, error.message);
  });
  
  return job;
}

// Get job status and result
function getJob(jobId) {
  return jobs.get(jobId);
}

// Get all jobs for an app ID
function getJobsByAppId(appId) {
  return Array.from(jobs.values()).filter(job => job.appId === appId);
}

// Update job status
function updateJobStatus(jobId, status, progress, message, result = null, error = null) {
  const job = jobs.get(jobId);
  if (job) {
    job.status = status;
    job.progress = progress;
    job.message = message;
    job.updatedAt = new Date().toISOString();
    if (result) job.result = result;
    if (error) job.error = error;
    jobs.set(jobId, job);
    console.log(`Job ${jobId} updated: ${status} (${progress}%) - ${message}`);
  }
}

// Process a job asynchronously
async function processJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  try {
    const { appId, storeType, options } = job;
    
    // Step 1: Fetch reviews
    updateJobStatus(jobId, JOB_STATUS.FETCHING_REVIEWS, 20, 'Fetching reviews from app store...');
    
    let reviews;
    if (storeType === 'apple') {
      if (options.usePagination) {
        reviews = await fetchAppStoreReviewsPaginated(appId, {
          country: options.country,
          startPage: options.startPage,
          maxPages: options.maxPages,
          perPageSave: options.perPageSave,
        });
      } else {
        reviews = await fetchAppStoreReviews(appId, options.country, options.limit);
      }
    } else if (storeType === 'google') {
      if (options.usePagination) {
        reviews = await fetchGooglePlayReviewsPaginated(appId, {
          country: options.country,
          pageSize: options.pageSize,
          maxPages: options.maxPages,
          perPageSave: options.perPageSave,
        });
      } else {
        reviews = await fetchGooglePlayReviews(appId, options.country, options.limit);
      }
    } else {
      throw new Error(`Unsupported store type: ${storeType}`);
    }
    
    updateJobStatus(jobId, JOB_STATUS.FETCHING_REVIEWS, 50, `Fetched ${reviews.length} reviews`);
    
    // Check if we have reviews to analyze
    if (reviews.length === 0) {
      throw new Error(`No reviews found for app ${appId} in ${storeType} store. The app might not exist, have no reviews, or the ID might be incorrect.`);
    }
    
    // Step 2: Analyze reviews
    updateJobStatus(jobId, JOB_STATUS.ANALYZING, 60, 'Analyzing reviews with AI...');
    
    const analysis = await analyzeReviews(reviews, appId, storeType);
    
    updateJobStatus(jobId, JOB_STATUS.ANALYZING, 90, 'Analysis completed, saving results...');
    
    // Step 3: Save additional job metadata
    const dataDir = path.join(__dirname, '../data');
    await fs.ensureDir(dataDir);
    
    const jobResult = {
      jobId,
      appId,
      storeType,
      reviewsCount: reviews.length,
      analysis,
      completedAt: new Date().toISOString()
    };
    
    await fs.writeJson(path.join(dataDir, `${jobId}_job_result.json`), jobResult, { spaces: 2 });
    
    // Step 4: Complete job
    updateJobStatus(jobId, JOB_STATUS.COMPLETED, 100, 'Analysis completed successfully', analysis);
    
    console.log(`Job ${jobId} completed successfully`);
    
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    updateJobStatus(jobId, JOB_STATUS.FAILED, 0, `Processing failed: ${error.message}`, null, error.message);
    throw error;
  }
}

// Clean up old jobs (optional, for memory management)
function cleanupOldJobs(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
  const now = Date.now();
  for (const [jobId, job] of jobs.entries()) {
    const jobAge = now - new Date(job.createdAt).getTime();
    if (jobAge > maxAge && (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.FAILED)) {
      jobs.delete(jobId);
      console.log(`Cleaned up old job ${jobId}`);
    }
  }
}

// Auto cleanup every hour
setInterval(cleanupOldJobs, 60 * 60 * 1000);

module.exports = {
  createJob,
  getJob,
  getJobsByAppId,
  JOB_STATUS,
  cleanupOldJobs
};