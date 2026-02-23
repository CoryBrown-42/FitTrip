#!/usr/bin/env bash
set -e

echo "================================"
echo "  FitTrip Build & Sync Script"
echo "================================"
echo ""

PLATFORM=${1:-all}

# Check for .env file
if [ ! -f ".env" ]; then
    echo "[WARNING] No .env file found!"
    echo "Copy .env.example to .env and add your Gemini API key."
    echo ""
    exit 1
fi

# Install dependencies
echo "[1/4] Installing npm dependencies..."
npm install

# Build the web app
echo "[2/4] Building web app..."
npm run build

# Sync platforms
echo "[3/4] Syncing to native projects..."
if [ "$PLATFORM" = "android" ]; then
    npx cap sync android
elif [ "$PLATFORM" = "ios" ]; then
    npx cap sync ios
else
    npx cap sync
fi

# Open IDE
echo "[4/4] Opening IDE..."
if [ "$PLATFORM" = "android" ]; then
    npx cap open android
elif [ "$PLATFORM" = "ios" ]; then
    if [[ "$(uname)" != "Darwin" ]]; then
        echo "[WARNING] iOS builds require macOS. Skipping Xcode open."
    else
        npx cap open ios
    fi
else
    npx cap open android
    if [[ "$(uname)" = "Darwin" ]]; then
        npx cap open ios
    fi
fi

echo ""
echo "================================"
echo "  Done!"
echo "================================"
echo ""
echo "Usage: ./build.sh [android|ios|all]"
