#!/bin/bash

echo "Starting HotGist Backend API..."
echo

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies"
    exit 1
fi

echo
echo "Starting development server..."
echo "Backend API will be available at: http://localhost:3001"
echo
echo "Press Ctrl+C to stop the server"
echo

npm run dev
