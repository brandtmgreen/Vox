#!/usr/bin/env bash
# GreenTree ArborLink - Production Keystore Generator for Google Play Store
set -e

KEYSTORE_DIR="android/app"
KEYSTORE_PATH="${KEYSTORE_DIR}/greentree-release-key.jks"
KEY_ALIAS="greentree"
VALIDITY_DAYS=10000

echo "🌲 GreenTree ArborLink - Google Play Release Keystore Setup"
echo "=========================================================="

if [ -f "$KEYSTORE_PATH" ]; then
    echo "⚠️ Keystore already exists at: $KEYSTORE_PATH"
    echo "Skipping keytool generation to prevent overwriting."
    exit 0
fi

if ! command -v keytool &> /dev/null; then
    echo "❌ 'keytool' not found in current PATH."
    echo "Please install OpenJDK or run this script inside Android Studio's terminal:"
    echo "  sudo apt install openjdk-17-jdk -y"
    echo "Or run the command manually:"
    echo "  keytool -genkeypair -v -keystore android/app/greentree-release-key.jks -alias greentree -keyalg RSA -keysize 4096 -validity 10000"
    exit 1
fi

echo "Generating RSA 4096-bit Release Keystore valid for 27+ years..."

keytool -genkeypair -v \
  -keystore "$KEYSTORE_PATH" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 4096 \
  -validity "$VALIDITY_DAYS" \
  -storepass "${RELEASE_STORE_PASSWORD:-GreenTreePass2026!}" \
  -keypass "${RELEASE_KEY_PASSWORD:-GreenTreePass2026!}" \
  -dname "CN=GreenTree Operations, OU=Mobile Dispatch, O=GreenTree Arboriculture Management LLC, L=Columbus, ST=Georgia, C=US"

echo "✅ Production Keystore created successfully at: $KEYSTORE_PATH"
echo "Key Alias: $KEY_ALIAS"
echo "Ready for: ./gradlew bundleRelease"
