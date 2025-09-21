#!/bin/bash

echo "Starting HotGist Development Environment..."
echo

echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies"
    exit 1
fi

echo
echo "Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo
echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!

echo
echo "Starting frontend server..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo
echo "Both servers are starting up..."
echo "Backend: http://localhost:3000"
echo "Frontend: Check the Expo CLI output for the development URL"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID
