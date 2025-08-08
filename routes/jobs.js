const express = require('express');
const router = express.Router();
const { createJob, getJob, getJobsByAppId, JOB_STATUS, createCompletedJobFromCache } = require('../services/jobService');
const fs = require('fs-extra');
const path = require('path');
const { detectStoreFromInput } = require('../services/storeDetector');

// API 1: Submit analysis request
router.post('/analyze', async (req, res) => {
  try {
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

    // Cache check (24h)
    const dataDir = path.join(__dirname, '../data');
    const cacheFile = path.join(dataDir, `${finalAppId}_analysis.json`);
    if (await fs.pathExists(cacheFile)) {
      const stat = await fs.stat(cacheFile);
      const ageMs = Date.now() - stat.mtimeMs;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (ageMs <= twentyFourHours) {
        const cachedAnalysis = await fs.readJson(cacheFile);
        const cachedJob = createCompletedJobFromCache(finalAppId, finalStoreType, cachedAnalysis);
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