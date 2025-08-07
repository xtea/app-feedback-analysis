#!/bin/bash

echo "Stopping any existing processes..."
pkill -f "node.*server.js" || true
pkill -f "react-scripts start" || true

echo "Starting server..."
cd /Users/jason/workspace/app-feedback-analysis
node server.js &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 3

echo "Starting client..."
cd /Users/jason/workspace/app-feedback-analysis/client
npm start &
CLIENT_PID=$!

echo "Development servers started!"
echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"
echo ""
echo "To stop both servers, run: kill $SERVER_PID $CLIENT_PID" 