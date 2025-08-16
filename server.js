const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8888;
const isProduction = process.env.NODE_ENV === 'production';
// const requireAuth = require('./middleware/auth');

// CORS configuration - allow React dev server and production
app.use(cors({
  origin: ['*'], // React dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Additional CORS headers for maximum compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Import routes
const appStoreRoutes = require('./routes/appStore');
const analysisRoutes = require('./routes/analysis');
const jobRoutes = require('./routes/jobs');

// Routes
app.use('/api/appstore', appStoreRoutes);
app.use('/api/analysis', analysisRoutes);
// Public access to jobs API (no login required)
app.use('/api/jobs', jobRoutes);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
}); 