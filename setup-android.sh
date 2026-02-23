#!/usr/bin/env bash
set -e

echo "================================"
echo "  FitTrip Android Setup Script"
echo "================================"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "[WARNING] No .env file found!"
    echo "Copy .env.example to .env and add your Gemini API key."
    echo ""
    exit 1
fi

# Install dependencies
echo "[1/5] Installing npm dependencies..."
npm install

# Install Capacitor packages if not present
echo "[2/5] Ensuring Capacitor packages are installed..."
npm install @capacitor/core @capacitor/cli @capacitor/android

# Build the web app
echo "[3/5] Building web app..."
npm run build

# Add Android platform if not present
if [ ! -d "android" ]; then
    echo "[4/5] Adding Android platform..."
    npx cap add android
else
    echo "[4/5] Android platform already exists, skipping..."
fi

# Sync web assets to Android
echo "[5/5] Syncing to Android project..."
npx cap sync android

echo ""
echo "================================"
echo "  Setup complete!"
echo "================================"
echo ""
echo "Opening Android Studio..."
npx cap open android
