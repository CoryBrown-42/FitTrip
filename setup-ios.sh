#!/usr/bin/env bash
set -e

echo "================================"
echo "  FitTrip iOS Setup Script"
echo "================================"
echo ""

# Check we're on macOS
if [[ "$(uname)" != "Darwin" ]]; then
    echo "[ERROR] iOS builds require macOS with Xcode installed."
    exit 1
fi

# Check for Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "[ERROR] Xcode is not installed."
    echo "Install it from the Mac App Store: https://apps.apple.com/app/xcode/id497799835"
    exit 1
fi

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
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Build the web app
echo "[3/5] Building web app..."
npm run build

# Add iOS platform if not present
if [ ! -d "ios" ]; then
    echo "[4/5] Adding iOS platform..."
    npx cap add ios
else
    echo "[4/5] iOS platform already exists, skipping..."
fi

# Sync web assets to iOS
echo "[5/5] Syncing to iOS project..."
npx cap sync ios

# Install CocoaPods if the project uses them
if [ -f "ios/App/Podfile" ]; then
    echo "[*] Installing CocoaPods dependencies..."
    cd ios/App && pod install && cd ../..
fi

echo ""
echo "================================"
echo "  Setup complete!"
echo "================================"
echo ""
echo "Opening Xcode..."
npx cap open ios
