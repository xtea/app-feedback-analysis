# AppReview.ai - AI-Powered App Store Review Analysis

**🌐 Website: [AppReview.ai](https://appreview.ai)**

A comprehensive web-based platform to collect and analyze app store feedback from Apple App Store and Google Play Store using advanced AI/LLM technology for sentiment analysis and feature extraction. Transform app store reviews into actionable insights to improve your app's success.

## 🚀 Features

### Core Analysis
- **📱 Multi-Platform Support**: Fetch reviews from both Apple App Store and Google Play Store
- **🤖 AI-Powered Analysis**: Advanced OpenAI GPT models for sentiment analysis and insight extraction
- **📊 Smart Categorization**: Automatically categorize reviews into positive, negative, and neutral
- **🔍 Feature Extraction**: Extract key features, user experiences, and improvement areas
- **📈 Visual Analytics**: Interactive charts and visualizations for comprehensive insights

### User Experience
- **👤 User Authentication**: Secure Supabase-powered authentication system
- **🪙 Credit System**: Pay-per-analysis credit system for authenticated users
- **⚡ Real-time Updates**: Live credit balance display in header
- **💾 Smart Caching**: 24-hour analysis caching to prevent duplicate charges
- **🎨 Modern UI**: Beautiful, responsive React-based interface

### Technical Excellence
- **🔄 Async Processing**: Non-blocking job queue for large-scale analysis
- **📱 Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **🚀 High Performance**: Efficient data processing and API optimization
- **🔒 Secure**: JWT-based authentication and secure data handling

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **OpenAI API key** (for AI analysis)
- **Supabase account** (for authentication and credit management)
  - Supabase project URL
  - Supabase anon/public key
  - Supabase service role key (for backend)
  - Supabase JWT secret

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app-feedback-analysis
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and configure the required services:
   ```bash
   # OpenAI Configuration (Required)
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o  # Optional: gpt-4o, gpt-4-turbo, gpt-4
   
   # Supabase Configuration (Required for auth & credits)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   
   # Server Configuration
   PORT=8888  # Optional: default 8888
   ```

5. **Set up Supabase database**
   
   Create the `user_credit` table in your Supabase database:
   ```sql
   CREATE TABLE user_credit (
     user_id VARCHAR PRIMARY KEY,
     credit BIGINT DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

6. **Set up frontend environment**
   ```bash
   cd client
   cp .env.example .env
   ```
   
   Edit `client/.env` for React app:
   ```bash
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Usage

### Development Mode

**Option A: Use the development script (Recommended)**
```bash
chmod +x dev-start.sh
./dev-start.sh
```

**Option B: Start manually**

1. **Start the backend server**
   ```bash
   node server.js
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm start
   ```

3. **Access the application**
   - Backend API: http://localhost:8888
   - Frontend: http://localhost:3000
   - **Proxy**: The React app automatically proxies API requests to the backend

### 🔧 Development Configuration

- **CORS**: Configured to allow React dev server connections
- **Proxy**: Frontend uses relative URLs that are proxied to backend
- **Hot Reload**: Both frontend and backend support hot reloading

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## How to Use

1. **Enter App ID or URL**: 
   - Apple: numeric ID (e.g., `284882215`) or App Store URL (e.g., `https://apps.apple.com/.../id284882215`)
   - Google: Android package (e.g., `com.facebook.katana`) or Play Store URL (e.g., `https://play.google.com/store/apps/details?id=com.facebook.katana`)
   - The UI auto-detects the store and normalizes the ID.

2. **(Optional) Store Type**: The UI switches automatically based on input; you can still choose manually.

3. **Start Analysis**: Click "Start Analysis". The backend triggers an async job to fetch reviews (paginated) and run AI analysis.

4. **View Results**: The analysis will show:
   - Summary statistics (total reviews, average rating, sentiment distribution)
   - Charts and visualizations
   - Positive insights (features, user experiences)
   - Improvement areas (issues, suggested fixes)

## 🔌 API Endpoints

### Job Management (Async Analysis)
- `POST /api/jobs/analyze` - Submit analysis job (supports both authenticated & anonymous users)
  - **Authentication**: Optional (JWT Bearer token in Authorization header)
  - **Credit Cost**: 1 credit for authenticated users, free for anonymous
  - **Caching**: 24-hour cache prevents duplicate charges
  - Request body fields:
    - `appId` (string): Apple ID, Android package, or official store URL
    - `storeType` (string, optional): `apple` | `google` | `auto` (default: `auto`)
    - `usePagination` (boolean, optional): default `true`
    - `pageSize` (number, optional): Google per-page size (default `100`)
    - `country` (string, optional): default `us`
    - Note: Apple pagination is inherently capped by the source to 10 pages max.
- `GET /api/jobs/status/:jobId` - Check job status and progress
- `GET /api/jobs/result/:jobId` - Get completed analysis results
- `GET /api/jobs/app/:appId` - Get all jobs for an app

### Credit Management (Authenticated Users)
- `GET /api/credit/balance` - Get current user's credit balance
- `POST /api/credit/add` - Add credits to user account
  - Body: `{ "amount": number }`
- `POST /api/credit/subtract` - Subtract credits from user account
  - Body: `{ "amount": number }`
- `POST /api/credit/set` - Set user's credit to specific amount
  - Body: `{ "amount": number, "userId": "optional" }`
- `POST /api/credit/check` - Check if user has sufficient credits
  - Body: `{ "requiredAmount": number }`
- `GET /api/credit/all` - Get all users' credit balances (admin)
  - Query params: `?limit=50&offset=0`

### App Store Routes (Direct)
- `POST /api/appstore/fetch-apple` - Fetch Apple App Store reviews
- `POST /api/appstore/fetch-google` - Fetch Google Play Store reviews

### Analysis Routes (Legacy)
- `POST /api/analysis/analyze` - Analyze reviews using LLM (synchronous)
- `GET /api/analysis/summary/:appId` - Get analysis summary

## 📁 Project Structure

```
app-feedback-analysis/
├── server.js                      # Main Express server
├── routes/                        # API route handlers
│   ├── appStore.js               # App store data (direct)
│   ├── analysis.js               # Legacy LLM analysis endpoints
│   ├── jobs.js                   # Async job submission & status APIs
│   └── credit.js                 # Credit management APIs
├── services/                      # Business logic
│   ├── appStoreService.js        # Apple & Google review fetchers
│   ├── jobService.js             # In-memory job queue & processing
│   ├── analysisService.js        # OpenAI integration (GPT-4 configurable)
│   ├── creditService.js          # Credit management & Supabase integration
│   ├── supabase.js               # Supabase backend client
│   ├── storeDetector.js          # Auto-detect store from raw input/URL
│   └── db.js                     # SQLite database (local storage)
├── middleware/                    # Express middleware
│   └── auth.js                   # JWT authentication middleware
├── data/                          # Local data storage
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Header.js         # Navigation with credit balance
│   │   │   ├── Home.js           # Analysis submission form
│   │   │   ├── Analysis.js       # Results visualization
│   │   │   ├── Auth.js           # Login/signup forms
│   │   │   ├── Footer.js         # Site footer
│   │   │   ├── Privacy.js        # Privacy policy
│   │   │   └── Terms.js          # Terms of service
│   │   ├── lib/                  # Frontend utilities
│   │   │   ├── supabase.js       # Supabase frontend client
│   │   │   ├── creditService.js  # Frontend credit API calls
│   │   │   ├── analytics.js      # Google Analytics integration
│   │   │   └── logger.js         # Frontend logging utilities
│   │   ├── App.js                # Main React app component
│   │   └── index.js              # React app entry point
│   └── public/                   # Static assets
├── env.example                   # Environment variables template
├── dev-start.sh                  # Development startup script
├── restart-dev.sh                # Development restart script
└── package.json                  # Dependencies and scripts
```

## Analysis Features

### Positive Analysis
- **Top Features**: Most mentioned features users love
- **User Experiences**: Positive user experiences and satisfaction points
- **Strength Highlights**: What makes the app stand out

### Negative Analysis
- **Top Issues**: Most common problems users face
- **Critical Problems**: Issues that need immediate attention
- **Suggested Improvements**: Actionable solutions with priority levels

## Technical Details

### Data Fetching
- Apple reviews via `app-store-scraper` (paginated, up to 10 pages; ~50 reviews per page)
- Google reviews via `google-play-scraper` with `nextPaginationToken`
- Saves each page to `/data/{appId}_{store}_reviews_page_{n}.json` and an aggregated `/data/{appId}_{store}_reviews_all.json`

### AI Analysis
- Uses OpenAI GPT models (default: GPT‑4o)
- Configure via `OPENAI_MODEL` env var (e.g., `gpt-4o`, `gpt-4-turbo`, `gpt-4`)
- Structured prompts return strict JSON for easy parsing

### Data Storage
- Saves reviews and analysis results locally in JSON format
- Organized by app ID and store type
- Persistent storage for historical analysis

## Troubleshooting

### Common Issues

1. **Puppeteer Installation**
   ```bash
   # If you encounter Puppeteer issues on macOS
   npm install puppeteer --unsafe-perm=true
   ```

2. **OpenAI API Errors**
   - Ensure your API key is valid and has sufficient credits
   - Check the API rate limits

3. **App Store Access Issues**
   - Some apps may have limited review access
   - Try different app IDs for testing

### Performance Tips

- Apple caps pages to 10; plan accordingly (≈ up to ~500 recent reviews)
- Google supports deeper pagination via tokens; adjust `pageSize` as needed
- Keep `OPENAI_MODEL` choice in mind for cost/latency tradeoffs

## 🪙 Credit System & Authentication

### How Credits Work
- **Free Tier**: Anonymous users can perform free analysis with basic features
- **Authenticated Users**: Pay-per-analysis credit system (1 credit = 1 analysis)
- **Smart Caching**: Analyses are cached for 24 hours to prevent duplicate charges
- **Credit Management**: Full API for adding, subtracting, and managing credits

### Authentication Features
- **Supabase Integration**: Secure, scalable authentication system
- **JWT Tokens**: Industry-standard authentication tokens
- **User Profiles**: Email-based user accounts with secure password handling
- **Session Management**: Persistent sessions with automatic token refresh

### Pricing Model
- **Transparent**: 1 credit per analysis for authenticated users
- **Fair Usage**: Anonymous users can test the platform for free
- **No Hidden Costs**: Clear credit deduction before analysis starts
- **Cache Optimization**: Repeated analysis within 24 hours uses cache (no charge)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support & Contact

- **🌐 Website**: [AppReview.ai](https://appreview.ai)
- **📧 Issues**: For technical issues, please open an issue on the GitHub repository
- **📖 Documentation**: This README contains comprehensive setup and usage instructions
- **🚀 Feature Requests**: Submit feature requests through GitHub issues

---

**Built with ❤️ by the AppReview.ai Team**

*Transform your app store reviews into actionable insights with the power of AI.* 