const express = require('express');
const router = express.Router();
const { createJob, getJob, getJobsByAppId, JOB_STATUS, createCompletedJobFromCache, getPendingJobsForApp } = require('../services/jobService');
const fs = require('fs-extra');
const path = require('path');
const db = require('../services/db');
const { detectStoreFromInput } = require('../services/storeDetector');
const requireAuth = require('../middleware/auth');
const { hasEnoughCredit, subtractUserCredit } = require('../services/creditService');

// API 1: Submit analysis request (supports both authenticated and anonymous users)
router.post('/analyze', async (req, res) => {
  try {
    // Check if user is authenticated (optional)
    let userId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.slice(7);
        const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
        userId = payload.sub;
        console.log(`[JOBS] Authenticated user: ${userId}`);
      } catch (authError) {
        console.log('[JOBS] Invalid auth token provided, proceeding as anonymous');
      }
    }

    const {
      appId,
      storeType = 'auto',
      country = 'us',
      // single-shot option (non-paginated)
      limit = 100,
      // pagination options (maxPages is backend default only)
      usePagination = true,
      startPage = 1,
      pageSize = 100,
      perPageSave = true,
    } = req.body;
    
    if (!appId) {
      return res.status(400).json({ 
        success: false, 
        error: 'App ID is required' 
      });
    }

    let finalStoreType = storeType;
    let finalAppId = appId?.trim();
    if (!finalAppId) {
      return res.status(400).json({ success: false, error: 'App ID is required' });
    }

    if (storeType === 'auto') {
      const detected = detectStoreFromInput(finalAppId);
      if (!detected) {
        return res.status(400).json({ success: false, error: 'Unable to detect store from input. Provide a valid Apple ID, Google package, or official store URL.' });
      }
      finalStoreType = detected.storeType;
      finalAppId = detected.appId;
    }

    if (!['apple', 'google'].includes(finalStoreType)) {
      return res.status(400).json({ success: false, error: 'Store type must be either "apple" or "google" (or use "auto")' });
    }

    // Credit check for authenticated users (before cache check)
    if (userId) {
      console.log(`[JOBS] Checking credits for authenticated user: ${userId}`);
      
      // Check if user has enough credits
      const creditCheck = await hasEnoughCredit(userId, 1);
      if (!creditCheck.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to check user credits',
          details: creditCheck.error
        });
      }
      
      if (!creditCheck.hasEnough) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          currentCredit: creditCheck.currentCredit,
          requiredCredit: 1,
          message: 'You need at least 1 credit to perform an analysis. Please add credits to your account.'
        });
      }
    }

    // Cache check (24h) - check after validating user has sufficient credits
    const row = db.prepare('SELECT summary_json, positive_json, negative_json, store, timestamp FROM analyses WHERE app_id = ? LIMIT 1').get(finalAppId);
    if (row) {
      const ageMs = Date.now() - new Date(row.timestamp).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (ageMs <= twentyFourHours) {
        // Cached result found - return without credit deduction
        console.log(`[JOBS] Returning cached result for ${finalAppId} (age: ${Math.round(ageMs / (1000 * 60 * 60))}h) - no credit deducted`);
        const summary = JSON.parse(row.summary_json);
        const positiveAnalysis = row.positive_json ? JSON.parse(row.positive_json) : null;
        const negativeAnalysis = row.negative_json ? JSON.parse(row.negative_json) : null;
        const analysis = { appId: finalAppId, storeType: row.store, summary, positiveAnalysis, negativeAnalysis, timestamp: row.timestamp };
        const cachedJob = createCompletedJobFromCache(finalAppId, row.store, analysis);
        return res.json({ success: true, data: {
          jobId: cachedJob.id,
          appId: cachedJob.appId,
          storeType: cachedJob.storeType,
          status: cachedJob.status,
          message: cachedJob.message,
          createdAt: cachedJob.createdAt,
          options: cachedJob.options,
          result: cachedJob.result,
        }});
      }
    }

    // No cache hit - check for existing pending jobs to prevent duplicate work and charges
    const existingJobs = getPendingJobsForApp(finalAppId, finalStoreType);
    
    if (existingJobs.length > 0) {
      // Return existing job instead of creating a new one and charging again
      const existingJob = existingJobs[0];
      console.log(`[JOBS] Found existing job ${existingJob.id} for ${finalAppId} - no credit deducted`);
      return res.json({
        success: true,
        data: {
          jobId: existingJob.id,
          appId: existingJob.appId,
          storeType: existingJob.storeType,
          status: existingJob.status,
          message: 'Analysis already in progress',
          createdAt: existingJob.createdAt,
          options: existingJob.options,
          result: existingJob.result,
        }
      });
    }

    // No cache hit and no existing jobs - proceed with new analysis and deduct credit
    if (userId) {
      console.log(`[JOBS] User ${userId} proceeding with new analysis, deducting 1 credit...`);
      const deductResult = await subtractUserCredit(userId, 1);
      if (!deductResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to deduct credits',
          details: deductResult.error
        });
      }
      
      console.log(`[JOBS] Successfully deducted 1 credit from user ${userId}, new balance: ${deductResult.newCredit}`);
    } else {
      console.log('[JOBS] Anonymous user - analysis will proceed without credit deduction');
    }

    // Create and start the job
    const job = createJob(finalAppId, finalStoreType, {
      country,
      limit,
      usePagination,
      startPage,
      pageSize,
      perPageSave,
    });
    
    console.log(`Created analysis job ${job.id} for app ${appId} (${storeType})`);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        appId: job.appId,
        storeType: job.storeType,
        status: job.status,
        message: job.message,
        createdAt: job.createdAt,
        options: job.options,
      }
    });
    
  } catch (error) {
    console.error('Error creating analysis job:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create analysis job', 
      details: error.message 
    });
  }
});

// API 2: Check job status and get results
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Job ID is required' 
      });
    }

    const job = getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        error: 'Job not found' 
      });
    }

    // Return job status with appropriate data based on status
    const response = {
      success: true,
      data: {
        jobId: job.id,
        appId: job.appId,
        storeType: job.storeType,
        status: job.status,
        progress: job.progress,
        message: job.message,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }
    };

    // Include result if job is completed
    if (job.status === JOB_STATUS.COMPLETED && job.result) {
      response.data.result = job.result;
    }

    // Include error if job failed
    if (job.status === JOB_STATUS.FAILED && job.error) {
      response.data.error = job.error;
    }

    res.json(response);
    
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get job status', 
      details: error.message 
    });
  }
});

// Get all jobs for a specific app ID
router.get('/app/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    
    if (!appId) {
      return res.status(400).json({ 
        success: false, 
        error: 'App ID is required' 
      });
    }

    const jobs = getJobsByAppId(appId);
    
    // Transform jobs to include only necessary information
    const jobSummaries = jobs.map(job => ({
      jobId: job.id,
      appId: job.appId,
      storeType: job.storeType,
      status: job.status,
      progress: job.progress,
      message: job.message,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hasResult: job.status === JOB_STATUS.COMPLETED && !!job.result
    }));

    res.json({
      success: true,
      data: {
        appId,
        jobs: jobSummaries,
        total: jobSummaries.length
      }
    });
    
  } catch (error) {
    console.error('Error getting jobs for app:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get jobs for app', 
      details: error.message 
    });
  }
});

// Get job result (for completed jobs)
router.get('/result/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Job ID is required' 
      });
    }

    const job = getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        error: 'Job not found' 
      });
    }

    if (job.status !== JOB_STATUS.COMPLETED) {
      return res.status(400).json({ 
        success: false, 
        error: 'Job is not completed yet',
        status: job.status,
        progress: job.progress,
        message: job.message
      });
    }

    if (!job.result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Job result not found' 
      });
    }

    res.json({
      success: true,
      data: job.result
    });
    
  } catch (error) {
    console.error('Error getting job result:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get job result', 
      details: error.message 
    });
  }
});

module.exports = router;