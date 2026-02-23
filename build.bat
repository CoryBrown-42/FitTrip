@echo off
echo ================================
echo   FitTrip Build ^& Sync Script
echo ================================
echo.

set PLATFORM=%1
if "%PLATFORM%"=="" set PLATFORM=all

:: Check for .env file
if not exist ".env" (
    echo [WARNING] No .env file found!
    echo Copy .env.example to .env and add your Gemini API key.
    echo.
    pause
    exit /b 1
)

:: Install dependencies
echo [1/4] Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

:: Build the web app
echo [2/4] Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

:: Sync platforms
echo [3/4] Syncing to native projects...
if "%PLATFORM%"=="android" (
    call npx cap sync android
) else if "%PLATFORM%"=="ios" (
    call npx cap sync ios
) else (
    call npx cap sync
)
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed!
    pause
    exit /b 1
)

:: Open IDE
echo [4/4] Opening IDE...
if "%PLATFORM%"=="android" (
    call npx cap open android
) else if "%PLATFORM%"=="ios" (
    echo [WARNING] iOS builds require macOS with Xcode. Open the ios/ folder on a Mac.
) else (
    call npx cap open android
    echo [NOTE] For iOS, run this script on macOS or use: npx cap open ios
)

echo.
echo ================================
echo   Done!
echo ================================
echo.
echo Usage: build.bat [android^|ios^|all]
pause
