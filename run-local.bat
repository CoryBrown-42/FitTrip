@echo off
REM Run FitTrip app locally in browser (Windows)
REM Assumes Node.js and npm are installed

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Start development server
npm run dev

REM Wait for server to start, then open browser
REM (npm run dev usually opens browser automatically, but fallback)
start http://localhost:5173

pause
