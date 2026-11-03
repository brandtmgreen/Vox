import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  ShieldCheck, 
  Sparkles, 
  Share2, 
  PhoneCall, 
  Vibrate, 
  FileCode2,
  ExternalLink,
  Layers,
  Folder,
  Cpu,
  CheckCircle2,
  Activity,
  Code
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { androidBridge } from '../utils/androidNativeBridge';

interface AndroidApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

type TabType = 'overview' | 'source' | 'build' | 'hardware';

export const AndroidApkExportModal: React.FC<AndroidApkExportModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [hapticTested, setHapticTested] = useState<string | null>(null);
  const [selectedSourceFile, setSelectedSourceFile] = useState<string>('manifest');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    haptics.tap();
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTestHaptics = (type: 'tap' | 'medium' | 'hazard' | 'ring') => {
    if (type === 'tap') haptics.tap();
    else if (type === 'medium') haptics.medium();
    else if (type === 'hazard') haptics.hazardAlert();
    else if (type === 'ring') haptics.callRing();
    setHapticTested(type);
    setTimeout(() => setHapticTested(null), 1200);
  };

  const handleTestDialer = () => {
    haptics.tap();
    androidBridge.launchDialer('(706) 555-0144');
  };

  const nativeInfo = androidBridge.getNativeInfo();

  // Source files contents for live inspection
  const sourceFiles: Record<string, { filename: string; path: string; lang: string; content: string }> = {
    manifest: {
      filename: 'AndroidManifest.xml',
      path: 'android/app/src/main/AndroidManifest.xml',
      lang: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

    <!-- Permissions for Arboriculture Voice AI Call Answering & CRM Field Dispatch -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
</manifest>`,
    },
    activity: {
      filename: 'MainActivity.java',
      path: 'android/app/src/main/java/com/greentree/arborlink/MainActivity.java',
      lang: 'java',
      content: `package com.greentree.arborlink;

import com.getcapacitor.BridgeActivity;

/**
 * GreenTree ArborLink Native Android Entry Point
 * Host activity providing Android hardware bridging for microphone,
 * haptics, telephony intents, and ANSI Z133 safety notifications.
 */
public class MainActivity extends BridgeActivity {
    // Capacitor automatically initializes webview bridge,
    // audio recording permissions, and native intent filters
}`,
    },
    gradle: {
      filename: 'build.gradle',
      path: 'android/app/build.gradle',
      lang: 'groovy',
      content: `apply plugin: 'com.android.application'

android {
    namespace = "com.greentree.arborlink"
    compileSdk = 35 // Android 15
    defaultConfig {
        applicationId "com.greentree.arborlink"
        minSdkVersion 24 // Android 7.0+ (98.9% of global devices)
        targetSdkVersion 35 // Android 15
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:1.7.0"
    implementation "androidx.coordinatorlayout:coordinatorlayout:1.2.0"
    implementation "androidx.core:core-splashscreen:1.0.1"
    implementation project(':capacitor-android')
}`,
    },
    config: {
      filename: 'capacitor.config.ts',
      path: 'capacitor.config.ts',
      lang: 'typescript',
      content: `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greentree.arborlink',
  appName: 'GreenTree ArborLink',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#064e3b',
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;`,
    },
    strings: {
      filename: 'strings.xml',
      path: 'android/app/src/main/res/values/strings.xml',
      lang: 'xml',
      content: `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">GreenTree ArborLink</string>
    <string name="title_activity_main">GreenTree ArborLink</string>
    <string name="package_name">com.greentree.arborlink</string>
    <string name="custom_url_scheme">com.greentree.arborlink</string>
</resources>`,
    },
  };

  const quickCliScript = `# 1. Build and sync web assets to Android native project
npm run cap:sync

# 2. Open project directly in Android Studio
npx cap open android

# 3. Or build native debug APK from command line
cd android
./gradlew assembleDebug

# -> Outputs: android/app/build/outputs/apk/debug/app-debug.apk
# Install directly to plugged-in Android device via ADB:
adb install app/build/outputs/apk/debug/app-debug.apk`;

  const playStoreScript = `# 1. Generate release signing keystore (one-time)
keytool -genkey -v -keystore greentree-release-key.keystore -alias greentree -keyalg RSA -keysize 2048 -validity 10000

# 2. Build production Android App Bundle (AAB) for Google Play Console
cd android
./gradlew bundleRelease

# -> Generated file ready for Google Play Store upload:
# android/app/build/outputs/bundle/release/app-release.aab`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 p-2 flex items-center justify-center border border-emerald-400/30 shrink-0">
              <img src="/icon.svg" alt="GreenTree" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black text-white">Android Native Application Hub</h3>
                <span className="bg-emerald-500/25 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-emerald-500/40">
                  Capacitor 8 • Android 15 Ready
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1">
                Native package <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-emerald-300">{nativeInfo.packageName}</code> generated with full Android Studio project &amp; hardware APIs.
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/10 pt-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => { setActiveTab('overview'); haptics.tap(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'bg-white/10 text-stone-300 hover:bg-white/15'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Native Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('source'); haptics.tap(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'source'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'bg-white/10 text-stone-300 hover:bg-white/15'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source Files</span>
            </button>

            <button
              onClick={() => { setActiveTab('hardware'); haptics.tap(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'hardware'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'bg-white/10 text-stone-300 hover:bg-white/15'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware &amp; Haptics</span>
            </button>

            <button
              onClick={() => { setActiveTab('build'); haptics.tap(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'build'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'bg-white/10 text-stone-300 hover:bg-white/15'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Build &amp; Run (.APK/.AAB)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Native Project Status Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      🤖
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-base">Android Native Project Configured</h4>
                      <p className="text-xs text-stone-600">Generated inside <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-900">/android</code> with Gradle &amp; AndroidManifest</p>
                    </div>
                  </div>
                  <a
                    href="/greentree-arborlink-android-native.tar.gz"
                    download="greentree-arborlink-android-native.tar.gz"
                    onClick={() => haptics.success()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Project Bundle (.tar.gz)</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">Package ID</span>
                    <span className="font-mono font-bold text-stone-900 text-[11px] truncate block">com.greentree.arborlink</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">Target SDK</span>
                    <span className="font-bold text-emerald-800 text-xs">Android 15 (API 35)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">Min SDK</span>
                    <span className="font-bold text-stone-700 text-xs">API 24 (Android 7.0+)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">Bridge Engine</span>
                    <span className="font-bold text-stone-900 text-xs">Capacitor 8.6.0</span>
                  </div>
                </div>
              </div>

              {/* Instant WebAPK Install Option */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Direct On-Device WebAPK Installation
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Zero Setup</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Open this application in <strong>Chrome for Android</strong> or <strong>Samsung Internet</strong> on any Android device. Tap the browser menu <strong>⋮ &rarr; Install app</strong> to install the native WebAPK with full offline caching and adaptive icons.
                </p>
                <div className="flex items-center gap-2 font-mono text-[11px] bg-white p-2 rounded-lg text-emerald-900 border border-stone-200 select-all">
                  <span className="truncate">{appUrl}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOURCE FILES */}
          {activeTab === 'source' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {Object.entries(sourceFiles).map(([key, file]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedSourceFile(key); haptics.tap(); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      selectedSourceFile === key
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {file.filename}
                  </button>
                ))}
              </div>

              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-950 text-stone-100">
                <div className="bg-stone-900 px-4 py-2.5 flex items-center justify-between border-b border-stone-800 text-xs">
                  <span className="font-mono text-emerald-400 text-[11px]">
                    {sourceFiles[selectedSourceFile].path}
                  </span>
                  <button
                    onClick={() => copyToClipboard(sourceFiles[selectedSourceFile].content, selectedSourceFile)}
                    className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-stone-200 px-2 py-1 rounded-lg transition-colors"
                  >
                    {copiedSection === selectedSourceFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === selectedSourceFile ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-[360px] whitespace-pre leading-relaxed">
                  {sourceFiles[selectedSourceFile].content}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: HARDWARE & SENSORS */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Vibrate className="w-4 h-4 text-emerald-600" />
                  Native Android Haptic Feedback Engine
                </h4>
                <p className="text-xs text-stone-600">
                  Powered by <code className="font-mono bg-white px-1 py-0.5 rounded border border-stone-200 text-stone-800">@capacitor/haptics</code> and Android <code className="font-mono bg-white px-1 py-0.5 rounded border border-stone-200 text-stone-800">Vibrator</code> service:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleTestHaptics('tap')}
                    className="p-3 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition-all active:scale-98 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">Light Tap Pulse</span>
                      <span className="text-[10px] text-stone-500">Button and tab interactions</span>
                    </div>
                    <span className="text-[10px] bg-stone-100 text-stone-700 font-bold px-2 py-1 rounded-lg">
                      {hapticTested === 'tap' ? 'Firing...' : 'Test'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestHaptics('medium')}
                    className="p-3 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition-all active:scale-98 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">Medium Impact</span>
                      <span className="text-[10px] text-stone-500">Audio playback scrubber &amp; toggles</span>
                    </div>
                    <span className="text-[10px] bg-stone-100 text-stone-700 font-bold px-2 py-1 rounded-lg">
                      {hapticTested === 'medium' ? 'Firing...' : 'Test'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestHaptics('hazard')}
                    className="p-3 bg-rose-50/70 hover:bg-rose-50 rounded-xl border border-rose-200 text-left transition-all active:scale-98 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-rose-900 block">ANSI Z133 Emergency Alarm</span>
                      <span className="text-[10px] text-rose-600">Power line &amp; roof hazard alert pattern</span>
                    </div>
                    <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-1 rounded-lg">
                      {hapticTested === 'hazard' ? 'Alarming!' : 'Test'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestHaptics('ring')}
                    className="p-3 bg-emerald-50/70 hover:bg-emerald-50 rounded-xl border border-emerald-200 text-left transition-all active:scale-98 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-emerald-950 block">Incoming Call Vibration</span>
                      <span className="text-[10px] text-emerald-700">Arb-E live phone ring cadence</span>
                    </div>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-1 rounded-lg">
                      {hapticTested === 'ring' ? 'Ringing!' : 'Test'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Native Telephony & Permissions */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  Android Telephony Intent &amp; Permissions
                </h4>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200">
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">Direct Telephony Dialer Intent</span>
                    <span className="text-[10px] text-stone-500">Launches Android native phone dialer for customer callbacks</span>
                  </div>
                  <button
                    onClick={handleTestDialer}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Launch Dialer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BUILD & RUN (.APK / .AAB) */}
          {activeTab === 'build' && (
            <div className="space-y-4">
              {/* Build Commands */}
              <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">Android Studio &amp; Debug APK Build</h4>
                  </div>
                  <button
                    onClick={() => copyToClipboard(quickCliScript, 'quickCli')}
                    className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-stone-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copiedSection === 'quickCli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'quickCli' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-black/50 p-3.5 rounded-xl text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed border border-white/5">
                  {quickCliScript}
                </pre>
              </div>

              {/* Play Store Bundle Script */}
              <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">Google Play Store Production Bundle (.AAB)</h4>
                  </div>
                  <button
                    onClick={() => copyToClipboard(playStoreScript, 'playStore')}
                    className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-stone-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copiedSection === 'playStore' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'playStore' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-black/50 p-3.5 rounded-xl text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed border border-white/5">
                  {playStoreScript}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-stone-600 font-medium">
              Android Source in <code className="font-mono bg-stone-200 px-1 rounded text-stone-800">/android</code> • Ready for Android Studio
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-colors"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
