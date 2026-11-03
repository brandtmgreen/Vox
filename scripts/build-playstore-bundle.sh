#!/usr/bin/env bash
# GreenTree ArborLink - Production Google Play Store App Bundle (.AAB) Builder
set -e

echo "🌲 GreenTree ArborLink - Building Google Play App Bundle (AAB)"
echo "============================================================="

# 1. Clean build Vite frontend
echo "📦 Step 1: Building production web frontend..."
npm run build

# 2. Sync web build to native Android Capacitor project
echo "🔄 Step 2: Syncing build assets into android/app/src/main/assets/public..."
npx cap sync android

# 3. Check for release keystore
if [ ! -f "android/app/greentree-release-key.jks" ]; then
    echo "ℹ️  No release keystore detected at android/app/greentree-release-key.jks."
    echo "    The build will sign with standard Android debug keystore fallback."
    echo "    To sign with your production key, run: ./scripts/generate-release-keystore.sh"
fi

# 4. Invoke Gradle bundleRelease
echo "⚡ Step 3: Compiling Android App Bundle (.aab) with Gradle..."
if [ -f "./android/gradlew" ]; then
    cd android
    chmod +x gradlew
    ./gradlew bundleRelease
    cd ..
    echo "✅ Play Store Bundle build complete!"
    echo "Output: android/app/build/outputs/bundle/release/app-release.aab"
else
    echo "ℹ️  Android project synced. Open /android in Android Studio and select:"
    echo "    Build > Generate Signed Bundle / APK > Android App Bundle"
fi
