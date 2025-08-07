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

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- Chrome/Chromium browser (for Puppeteer)

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
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000
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

1. **Enter App ID**: 
   - For Apple App Store: Use the numeric ID (e.g., `284882215` for Facebook)
   - For Google Play Store: Use the package name (e.g., `com.facebook.katana`)

2. **Select Store Type**: Choose between Apple App Store or Google Play Store

3. **Start Analysis**: Click "Start Analysis" to begin the process

4. **View Results**: The analysis will show:
   - Summary statistics (total reviews, average rating, sentiment distribution)
   - Charts and visualizations
   - Positive insights (features, user experiences)
   - Improvement areas (issues, suggested fixes)

## API Endpoints

### Job Management (Async Analysis)
- `POST /api/jobs/analyze` - Submit analysis job (returns job ID)
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
├── server.js                 # Main Express server
├── routes/                   # API route handlers
│   ├── appStore.js          # App store data fetching
│   └── analysis.js          # LLM analysis endpoints
├── services/                 # Business logic
│   ├── appStoreService.js   # Web scraping for reviews
│   └── analysisService.js   # OpenAI integration
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

### Web Scraping
- Uses Puppeteer for headless browser automation
- Handles dynamic content loading
- Extracts review data including ratings, titles, content, and dates

### AI Analysis
- Uses OpenAI GPT-3.5-turbo for analysis
- Structured prompts for consistent output
- JSON-formatted responses for easy parsing

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

- Limit the number of reviews fetched (default: 100)
- Use specific app IDs for faster results
- Consider caching analysis results for frequently analyzed apps

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