const express = require('express');
const router = express.Router();
const { createJob, getJob, getJobsByAppId, JOB_STATUS } = require('../services/jobService');

// API 1: Submit analysis request
router.post('/analyze', async (req, res) => {
  try {
    const { appId, storeType = 'apple', country = 'us', limit = 100 } = req.body;
    
    if (!appId) {
      return res.status(400).json({ 
        success: false, 
        error: 'App ID is required' 
      });
    }

    if (!['apple', 'google'].includes(storeType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Store type must be either "apple" or "google"' 
      });
    }

    // Create and start the job
    const job = createJob(appId, storeType, { country, limit });
    
    console.log(`Created analysis job ${job.id} for app ${appId} (${storeType})`);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        appId: job.appId,
        storeType: job.storeType,
        status: job.status,
        message: job.message,
        createdAt: job.createdAt
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