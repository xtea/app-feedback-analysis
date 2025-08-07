#!/bin/bash

# Development startup script for App Feedback Analysis Tool

echo "🚀 Starting App Feedback Analysis Development Environment"
echo ""

# Check if backend server is already running
if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend server is already running on port 8888"
else
    echo "🔧 Starting backend server on port 8888..."
    node server.js &
    BACKEND_PID=$!
    echo "✅ Backend server started (PID: $BACKEND_PID)"
fi

echo ""

# Check if React dev server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  React dev server is already running on port 3000"
else
    echo "⚛️  Starting React development server..."
    cd client
    npm start &
    FRONTEND_PID=$!
    echo "✅ React dev server starting (PID: $FRONTEND_PID)"
    cd ..
fi

echo ""
echo "🌟 Development servers are starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8888"
echo ""
echo "📋 API Endpoints:"
echo "   POST /api/jobs/analyze - Submit analysis job"
echo "   GET  /api/jobs/status/{jobId} - Check job status"
echo "   GET  /api/analysis/summary/{appId} - Get analysis results"
echo ""
echo "⚡ The React app uses a proxy to connect to the backend API"
echo "💡 Use Ctrl+C to stop the servers"

# Wait for user input to keep script running
echo ""
read -p "Press Enter to stop all servers..." -r

# Kill background processes
if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
fi

if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
fi

# Also kill any remaining processes on those ports
pkill -f "node server.js" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

echo "🛑 Development servers stopped"
