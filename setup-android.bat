@echo off
echo ================================
echo   FitTrip Android Setup Script
echo ================================
echo.

:: Check for .env file
if not exist ".env" (
    echo [WARNING] No .env file found!
    echo Copy .env.example to .env and add your Gemini API key.
    echo.
    pause
    exit /b 1
)

:: Install dependencies
echo [1/5] Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

:: Install Capacitor packages if not present
echo [2/5] Ensuring Capacitor packages are installed...
call npm install @capacitor/core @capacitor/cli @capacitor/android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor install failed!
    pause
    exit /b 1
)

:: Build the web app
echo [3/5] Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

:: Add Android platform if not present
if not exist "android" (
    echo [4/5] Adding Android platform...
    call npx cap add android
) else (
    echo [4/5] Android platform already exists, skipping...
)

:: Sync web assets to Android
echo [5/5] Syncing to Android project...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo ================================
echo   Setup complete!
echo ================================
echo.
echo Opening Android Studio...
call npx cap open android

pause
