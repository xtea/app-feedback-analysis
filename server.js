const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8888;
const isProduction = process.env.NODE_ENV === 'production';
// const requireAuth = require('./middleware/auth');
const db = require('./services/db');

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


// Helper to compute absolute base URL for SEO endpoints
function getBaseUrl(req) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
}

// robots.txt for crawlers
app.get('/robots.txt', (req, res) => {
  const baseUrl = getBaseUrl(req);
  const content = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    ''
  ].join('\n');
  res.type('text/plain').send(content);
});

// Dynamic sitemap.xml built from known analysis pages
app.get('/sitemap.xml', (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const rows = db.prepare('SELECT app_id as appId, timestamp FROM analyses ORDER BY timestamp DESC').all();

    const urls = [];
    // Home
    urls.push({ loc: `${baseUrl}/`, changefreq: 'weekly', priority: '0.9' });
    // Login page
    urls.push({ loc: `${baseUrl}/login`, changefreq: 'monthly', priority: '0.3' });
    // Analysis pages
    for (const row of rows) {
      const lastmod = row.timestamp ? new Date(row.timestamp).toISOString() : undefined;
      urls.push({ loc: `${baseUrl}/analysis/${encodeURIComponent(row.appId)}`, lastmod, changefreq: 'weekly', priority: '0.7' });
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(u => `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`),
      '</urlset>'
    ].join('\n');

    res.type('application/xml').send(xml);
  } catch (e) {
    // On error, return a minimal sitemap with home only
    const baseUrl = getBaseUrl(req);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>`;
    res.type('application/xml').send(fallback);
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
}); 