@echo off
echo Starting HotGist Development Environment...
echo.

echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Starting backend server...
start "HotGist Backend" cmd /k "npm run dev"

echo.
echo Starting frontend server...
start "HotGist Frontend" cmd /k "cd client && npm start"

echo.
echo Both servers are starting up...
echo Backend: http://localhost:3000
echo Frontend: Check the Expo CLI output for the development URL
echo.
echo Press any key to exit...
pause > nul
