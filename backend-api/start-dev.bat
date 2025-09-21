@echo off
echo Starting HotGist Backend API...
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting development server...
echo Backend API will be available at: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
