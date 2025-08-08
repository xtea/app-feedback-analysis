# App Feedback Analysis Tool

A web-based tool to collect and analyze app store feedback from Apple App Store and Google Play Store using AI/LLM for sentiment analysis and feature extraction.

## Features

- **App Store Integration**: Fetch reviews from both Apple App Store and Google Play Store
- **AI-Powered Analysis**: Use OpenAI's GPT models to analyze review sentiment and extract insights
- **Categorization**: Automatically categorize reviews into Good and Bad categories
- **Feature Extraction**: Extract key features, user experiences, and improvement areas
- **Beautiful UI**: Modern React-based interface with charts and visualizations
- **Data Persistence**: Save analysis results locally for future reference

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- OpenAI API key

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
   
   Edit `.env` and add your OpenAI API key and (optionally) model:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   # Optional: choose model (default: gpt-4o). Examples: gpt-4o, gpt-4-turbo, gpt-4
   OPENAI_MODEL=gpt-4o
   # Optional: server port (default 8888)
   PORT=8888
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

## API Endpoints

### Job Management (Async Analysis)
- `POST /api/jobs/analyze` - Submit analysis job (returns job ID)
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

### App Store Routes (Direct)
- `POST /api/appstore/fetch-apple` - Fetch Apple App Store reviews
- `POST /api/appstore/fetch-google` - Fetch Google Play Store reviews

### Analysis Routes (Legacy)
- `POST /api/analysis/analyze` - Analyze reviews using LLM (synchronous)
- `GET /api/analysis/summary/:appId` - Get analysis summary

## Project Structure

```
app-feedback-analysis/
├── server.js                      # Main Express server
├── routes/                        # API route handlers
│   ├── appStore.js               # App store data (direct)
│   ├── analysis.js               # Legacy LLM analysis endpoints
│   └── jobs.js                   # Async job submission & status APIs
├── services/                      # Business logic
│   ├── appStoreService.js        # Apple & Google review fetchers (paged & single-shot)
│   ├── jobService.js             # In-memory job queue & processing
│   ├── analysisService.js        # OpenAI integration (GPT-4 configurable)
│   └── storeDetector.js          # Auto-detect store from raw input/URL
├── data/                    # Local data storage
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Header.js
│   │   │   ├── Home.js
│   │   │   └── Analysis.js
│   │   ├── App.js
│   │   └── index.js
│   └── public/
└── package.json
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on the GitHub repository. 