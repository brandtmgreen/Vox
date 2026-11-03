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
  PhoneCall, 
  Vibrate, 
  FileCode2,
  ExternalLink,
  Layers,
  Folder,
  Cpu,
  CheckCircle2,
  Activity,
  Code,
  FileText,
  BadgeAlert,
  Image as ImageIcon,
  Lock,
  Globe,
  HelpCircle,
  PackageCheck
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { androidBridge } from '../utils/androidNativeBridge';

interface AndroidApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

type TabType = 'playstore' | 'datasafety' | 'privacy' | 'build' | 'hardware' | 'source';

export const AndroidApkExportModal: React.FC<AndroidApkExportModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('playstore');
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

  // Play Store Listing Metadata
  const playStoreMetadata = {
    title: "GreenTree Front Desk: Voice Intake",
    shortDescription: "Front desk call intake, caller data capture & lead generation for GreenTree Arboriculture.",
    fullDescription: `GreenTree Front Desk is the voice operations and front desk lead generation assistant built specifically for GreenTree Arboriculture Management. Powered by Arb-E 🐒, the friendly virtual receptionist voice agent, Front Desk automates caller triage, captures customer contact details and property access notes from incoming calls and voicemails, and forwards complete lead packages directly into the GreenTree Arboriculture Management field arborist workflow.

🌲 FRONT DESK EXCELLENCE FOR TREE CARE
Whether fielding emergency storm calls in Columbus, GA, or logging routine pruning requests across Phenix City, AL, GreenTree Front Desk ensures zero dropped customer inquiries, clean data capture, and immediate routing to on-site certified arborists.

⚡ KEY CAPABILITIES:
• Arb-E Virtual Voice Receptionist: Hands-free intake answers phone calls, captures property addresses, customer callbacks, gate codes, and requested scopes of work.
• Front Desk Property & Site Notes: Flags caller-reported conditions (overhead lines nearby, structural contact, pet warnings) so field arborists arrive fully informed.
• 1-Click Workflow Forwarding: Packages qualified leads and instantly forwards them to GreenTree Arboriculture Management field estimators and crews.
• Real-time CRM Sync: Automatically synchronizes caller contacts, call recordings, and lead tickets with zero manual paperwork.
• Native Telephony & Hardware Integration: 1-touch client callback dialer, tactical haptic feedback alerts for urgent calls, and status bar integration.

🛡️ DATA INTEGRITY & PRIVACY
GreenTree Front Desk is engineered with security and privacy best practices. Audio data captured during voice calls is securely transcribed over TLS 1.3 encryption and is strictly used for lead qualification and workflow handoff. No customer data is sold or shared.`,
    category: "Business / Productivity",
    tags: "Front Desk, Tree Care, Voice AI, Lead Generation, CRM, Field Dispatch",
    contentRating: "Everyone (No objectionable content)",
    supportEmail: "braandtgreen@gmail.com",
    privacyUrl: `${appUrl}/privacy`,
    packageId: "com.greentree.frontdesk",
    version: "1.0.0 (Build 1)",
    targetSdk: "Android 15 (API 35/36)",
    minSdk: "Android 7.0 (API 24)"
  };

  // Google Play Console Data Safety Mapping
  const dataSafetyAnswers = [
    {
      category: "Audio files (Microphone)",
      dataType: "Voice recordings & sound clips",
      collected: "Yes",
      shared: "No",
      processedEphemerally: "No (transcripts saved to CRM)",
      required: "Optional (only when using Voice AI / Voicemail)",
      purposes: ["App functionality", "Voice-to-text triage", "Safety hazard extraction"],
      encryption: "Encrypted in transit (HTTPS / TLS 1.3)",
      deletion: "Users can request deletion via email to braandtgreen@gmail.com"
    },
    {
      category: "Personal info",
      dataType: "Name, Phone Number, Physical Address, Email",
      collected: "Yes",
      shared: "No",
      processedEphemerally: "No (saved in contact directory)",
      required: "Yes (for job quotes & work orders)",
      purposes: ["Account & lead management", "Customer communications", "Service dispatch"],
      encryption: "Encrypted in transit & at rest",
      deletion: "Users can request immediate record purging"
    },
    {
      category: "Device & other IDs",
      dataType: "Haptic vibration state & Network connectivity",
      collected: "Yes (local hardware status only)",
      shared: "No",
      processedEphemerally: "Yes",
      required: "Yes (for tactical hazard alerts & offline sync)",
      purposes: ["App functionality & worker safety warning"],
      encryption: "N/A (Local to device)",
      deletion: "Not stored on external servers"
    }
  ];

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

    <!-- Permissions required for Voice AI, Arborist Safety & Telephony Bridge -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.CALL_PHONE" />

</manifest>`
    },
    buildGradle: {
      filename: 'build.gradle (Module: app)',
      path: 'android/app/build.gradle',
      lang: 'groovy',
      content: `apply plugin: 'com.android.application'

android {
    namespace = "com.greentree.arborlink"
    compileSdk = rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.greentree.arborlink"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    signingConfigs {
        release {
            def keystoreFile = file("greentree-release-key.jks")
            if (keystoreFile.exists()) {
                storeFile keystoreFile
                storePassword System.getenv("RELEASE_STORE_PASSWORD") ?: "GreenTreePass2026!"
                keyAlias System.getenv("RELEASE_KEY_ALIAS") ?: "greentree"
                keyPassword System.getenv("RELEASE_KEY_PASSWORD") ?: "GreenTreePass2026!"
            } else {
                storeFile file("debug.keystore")
                storePassword "android"
                keyAlias "androiddebugkey"
                keyPassword "android"
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}`
    },
    proguard: {
      filename: 'proguard-rules.pro',
      path: 'android/app/proguard-rules.pro',
      lang: 'properties',
      content: `# GreenTree ArborLink - ProGuard / R8 Rules for Google Play Store
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class com.greentree.arborlink.** { *; }
-keep public class * extends com.getcapacitor.Plugin

# JavaScript Interface preservation for WebView
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# AndroidX SplashScreen & Stack Trace Line Numbers
-keep class androidx.core.splashscreen.** { *; }
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature`
    },
    mainActivity: {
      filename: 'MainActivity.java',
      path: 'android/app/src/main/java/com/greentree/arborlink/MainActivity.java',
      lang: 'java',
      content: `package com.greentree.arborlink;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {}`
    },
    capacitorConfig: {
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
    cleartext: true
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#064e3b'
    }
  }
};

export default config;`
    }
  };

  const playStoreScript = `# 1. Generate Production Release Keystore (valid for 27+ years)
./scripts/generate-release-keystore.sh

# 2. Build Production Web Distribution & Sync Capacitor
npm run build
npx cap sync android

# 3. Compile Google Play Android App Bundle (.aab)
cd android
./gradlew bundleRelease

# 4. Find your verified .aab at:
# android/app/build/outputs/bundle/release/app-release.aab`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-600 flex items-center justify-center shadow-lg text-xl font-black text-emerald-950 border border-white/20">
              🌲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Google Play Store &amp; Android Hub</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  Submission Ready
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Package: <code className="font-mono text-emerald-300 font-bold">com.greentree.arborlink</code> • Version 1.0.0 (API 35)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-stone-100 border-b border-stone-200 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => { setActiveTab('playstore'); haptics.tap(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'playstore' 
                ? 'bg-white text-emerald-800 shadow-sm border border-stone-200' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Play Store Kit</span>
          </button>

          <button
            onClick={() => { setActiveTab('datasafety'); haptics.tap(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'datasafety' 
                ? 'bg-white text-emerald-800 shadow-sm border border-stone-200' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Safety Form</span>
          </button>

          <button
            onClick={() => { setActiveTab('privacy'); haptics.tap(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'privacy' 
                ? 'bg-white text-emerald-800 shadow-sm border border-stone-200' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => { setActiveTab('build'); haptics.tap(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'build' 
                ? 'bg-white text-emerald-800 shadow-sm border border-stone-200' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Keystore &amp; .AAB</span>
          </button>

          <button
            onClick={() => { setActiveTab('hardware'); haptics.tap(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'hardware' 
                ? 'bg-white text-emerald-800 shadow-sm border border-stone-200' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hardware Bridge</span>
          </button>

          <button
            onClick={() => { setActiveTab('source'); haptics.tap(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'source' 
                ? 'bg-white text-emerald-800 shadow-sm border border-stone-200' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Source Code</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: PLAY STORE LISTING KIT */}
          {activeTab === 'playstore' && (
            <div className="space-y-4">
              {/* Quick Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-lime-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
                      Google Play Console Submission Checklist
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Copy metadata directly into the Play Console store listing dashboard.
                    </p>
                  </div>
                </div>
                <a
                  href="/greentree-arborlink-android-native.tar.gz"
                  download="greentree-arborlink-android-native.tar.gz"
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .tar.gz (70MB)</span>
                </a>
              </div>

              {/* Title & Short Description Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-800">App Name (Max 30 chars)</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                        {playStoreMetadata.title.length}/30
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(playStoreMetadata.title, 'appTitle')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      {copiedSection === 'appTitle' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'appTitle' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl font-bold text-sm text-stone-900 border border-stone-200">
                    {playStoreMetadata.title}
                  </div>
                </div>

                {/* Short Description */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-800">Short Description (Max 80 chars)</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                        {playStoreMetadata.shortDescription.length}/80
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(playStoreMetadata.shortDescription, 'shortDesc')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      {copiedSection === 'shortDesc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'shortDesc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl text-xs text-stone-800 border border-stone-200 leading-relaxed">
                    {playStoreMetadata.shortDescription}
                  </div>
                </div>
              </div>

              {/* Full Description Card */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-800">Full Store Description (Formatted for Play Store)</span>
                  <button
                    onClick={() => copyToClipboard(playStoreMetadata.fullDescription, 'fullDesc')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    {copiedSection === 'fullDesc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'fullDesc' ? 'Copied Full Description' : 'Copy Full Description'}</span>
                  </button>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-700 border border-stone-200 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {playStoreMetadata.fullDescription}
                </div>
              </div>

              {/* Categorization & Store Graphics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categorization Details */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                  <h5 className="font-bold text-xs text-stone-900">Console Categorization &amp; Audience</h5>
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">App Category:</span>
                      <span className="font-bold text-stone-800">Business / Productivity</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Content Rating:</span>
                      <span className="font-bold text-emerald-700">Everyone (All Ages)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Contact Email:</span>
                      <span className="font-bold text-stone-800">braandtgreen@gmail.com</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Target SDK:</span>
                      <span className="font-bold text-stone-800">API 35 (Android 15)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Privacy Policy URL:</span>
                      <a href="/privacy" target="_blank" rel="noreferrer" className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
                        <span>/privacy</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Graphical Assets Pack */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                  <h5 className="font-bold text-xs text-stone-900">Official Play Store Graphic Assets</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="flex items-center gap-2">
                        <img src="/playstore-icon-512.png" alt="512 Icon" className="w-8 h-8 rounded-lg shadow-sm" />
                        <div>
                          <span className="font-bold text-xs block text-stone-900">High-Res App Icon</span>
                          <span className="text-[10px] text-stone-500">512 × 512 PNG (32-bit color)</span>
                        </div>
                      </div>
                      <a
                        href="/playstore-icon-512.png"
                        download="playstore-icon-512.png"
                        className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PNG</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-900 flex items-center justify-center text-xs text-emerald-300 font-bold">
                          1024
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-stone-900">Feature Graphic Banner</span>
                          <span className="text-[10px] text-stone-500">1024 × 500 PNG (Google Play Header)</span>
                        </div>
                      </div>
                      <a
                        href="/playstore-feature-graphic.png"
                        download="playstore-feature-graphic.png"
                        className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PNG</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-xs text-white font-bold">
                          📱
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-stone-900">Google Pixel Screenshot #1</span>
                          <span className="text-[10px] text-stone-500">App Interface with Lead Handoff</span>
                        </div>
                      </div>
                      <a
                        href="/playstore-screenshot-1.png"
                        download="playstore-screenshot-1.png"
                        className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PNG</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA SAFETY QUESTIONNAIRE */}
          {activeTab === 'datasafety' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <BadgeAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wider">
                    Google Play Console "Data Safety" Answers
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Google requires all apps declaring <code className="font-mono bg-amber-100 px-1 rounded">RECORD_AUDIO</code> and <code className="font-mono bg-amber-100 px-1 rounded">CALL_PHONE</code> to complete the Data Safety questionnaire. Below are the exact answers formatted for the Google Play Console form.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {dataSafetyAnswers.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-xs text-stone-900">{item.category}</h5>
                        <span className="text-[10px] text-stone-500 font-mono">({item.dataType})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                        Collected: {item.collected} • Shared: {item.shared}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-stone-500 font-medium block">Declared Purposes:</span>
                        <span className="font-semibold text-stone-800">{item.purposes.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-medium block">Security &amp; Encryption:</span>
                        <span className="font-semibold text-stone-800">{item.encryption}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-stone-500 font-medium block">Deletion Policy:</span>
                        <span className="font-semibold text-stone-800">{item.deletion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 1-Click Copy Data Safety Answers */}
              <div className="p-4 bg-stone-900 rounded-2xl text-white flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-white">Full Data Safety Summary Text</h5>
                  <p className="text-[11px] text-stone-400">Copy formatted text to paste into Play Console declarations</p>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(dataSafetyAnswers, null, 2), 'dataSafetyJson')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {copiedSection === 'dataSafetyJson' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'dataSafetyJson' ? 'Copied JSON' : 'Copy JSON Answers'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-emerald-950 uppercase tracking-wider">
                    Hosted Live Privacy Policy URL
                  </h4>
                  <p className="text-xs text-emerald-800 font-mono">
                    {appUrl}/privacy
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(`${appUrl}/privacy`, 'privacyUrl')}
                    className="px-3 py-1.5 bg-white text-emerald-900 hover:bg-stone-50 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  >
                    {copiedSection === 'privacyUrl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'privacyUrl' ? 'Copied' : 'Copy URL'}</span>
                  </button>
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  >
                    <span>View Live</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Policy Body */}
              <div className="p-4 bg-white rounded-2xl border border-stone-200 text-stone-700 text-xs leading-relaxed space-y-3 max-h-96 overflow-y-auto">
                <h4 className="font-extrabold text-sm text-stone-900">GreenTree Front Desk Privacy Policy</h4>
                <p><strong>Effective Date:</strong> November 1, 2026 • <strong>Version:</strong> 1.0.0</p>
                <p>
                  GreenTree Arboriculture Management LLC built the <strong>GreenTree Front Desk</strong> mobile application (Package: <code>com.greentree.frontdesk</code>) as a voice intake, customer data capture, and lead forwarding platform for front desk staff and dispatchers serving Columbus, Georgia and Phenix City, Alabama.
                </p>

                <h5 className="font-bold text-xs text-stone-900 pt-2 border-t border-stone-100">1. Information We Collect</h5>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Audio Recordings &amp; Voice Streams (Microphone Permission):</strong> When using Arb-E, the app accesses your device microphone (<code>RECORD_AUDIO</code>) solely during an active phone call simulation or voice memo capture. Audio is processed for real-time transcription and lead qualification. Audio is never recorded in the background.</li>
                  <li><strong>Client &amp; Job Intake Details:</strong> Caller names, callback phone numbers, job site service addresses, target tree species, tree count, and front-desk site notes (powerline proximity, roof structures, gate codes, pet alerts).</li>
                  <li><strong>Telephony &amp; Dialer Usage:</strong> With your direct permission, the app can open your device's native telephone dialer (<code>CALL_PHONE</code>) to initiate return phone calls to tree service clients.</li>
                  <li><strong>Device Hardware &amp; Diagnostic Info:</strong> Local device vibration (<code>VIBRATE</code>) for tactical incoming call alert haptic feedback, and network connectivity state for CRM synchronization.</li>
                </ul>

                <h5 className="font-bold text-xs text-stone-900 pt-2 border-t border-stone-100">2. Third-Party Services &amp; AI Processing</h5>
                <p>
                  Voice transcription and natural language entity extraction utilize the Google Gemini API (Google Cloud). Data passed to Google Cloud is transmitted over encrypted TLS 1.3 connections and is not used to train public machine learning models in accordance with Google Cloud enterprise privacy standards.
                </p>

                <h5 className="font-bold text-xs text-stone-900 pt-2 border-t border-stone-100">3. Contact &amp; Data Deletion</h5>
                <p>
                  You may request full deletion of any lead record, contact, or audio transcript at any time by contacting: <strong>braandtgreen@gmail.com</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: BUILD & RUN (.AAB / KEYSTORE) */}
          {activeTab === 'build' && (
            <div className="space-y-4">
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

              {/* Keystore Generation Card */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-stone-700" />
                    <h5 className="font-bold text-xs text-stone-900">Release Keystore Generator Script</h5>
                  </div>
                  <button
                    onClick={() => copyToClipboard("./scripts/generate-release-keystore.sh", 'keystoreCmd')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    {copiedSection === 'keystoreCmd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'keystoreCmd' ? 'Copied Command' : 'Copy Command'}</span>
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  We've provided a production keystore script configured with 4096-bit RSA encryption and 10,000 days (27+ years) validity, satisfying Google Play Store longevity rules.
                </p>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 font-mono text-[11px] text-stone-800">
                  keytool -genkeypair -v -keystore android/app/greentree-release-key.jks -alias greentree -keyalg RSA -keysize 4096 -validity 10000
                </div>
              </div>

              {/* Download Full Native Archive */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 to-emerald-950 text-white flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-white">Full Native Android Project (.tar.gz)</h5>
                  <p className="text-[11px] text-stone-300">Complete Gradle source, icons, ProGuard rules &amp; manifest</p>
                </div>
                <a
                  href="/greentree-arborlink-android-native.tar.gz"
                  download="greentree-arborlink-android-native.tar.gz"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Archive</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 5: HARDWARE BRIDGE & TELEPHONY */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Vibrate className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                    Tactical Vibration &amp; Urgent Alert Haptics
                  </h4>
                </div>
                <p className="text-xs text-stone-600">
                  Test the Android hardware vibration actuator bridge using native Capacitor Haptics.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => handleTestHaptics('tap')}
                    className="p-3 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl text-center transition-all"
                  >
                    <span className="font-bold text-xs text-stone-800 block">Light Tap</span>
                    <span className="text-[10px] text-stone-500">UI feedback</span>
                    {hapticTested === 'tap' && <span className="text-[10px] text-emerald-600 font-bold block mt-1 animate-pulse">Vibrated ✓</span>}
                  </button>

                  <button
                    onClick={() => handleTestHaptics('medium')}
                    className="p-3 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl text-center transition-all"
                  >
                    <span className="font-bold text-xs text-stone-800 block">Medium Pulse</span>
                    <span className="text-[10px] text-stone-500">Intake save</span>
                    {hapticTested === 'medium' && <span className="text-[10px] text-emerald-600 font-bold block mt-1 animate-pulse">Vibrated ✓</span>}
                  </button>

                  <button
                    onClick={() => handleTestHaptics('hazard')}
                    className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-center transition-all"
                  >
                    <span className="font-bold text-xs text-red-900 block">Priority Alert</span>
                    <span className="text-[10px] text-red-600 font-medium">Urgent call trip</span>
                    {hapticTested === 'hazard' && <span className="text-[10px] text-red-700 font-bold block mt-1 animate-pulse">Alert Pulse ✓</span>}
                  </button>

                  <button
                    onClick={() => handleTestHaptics('ring')}
                    className="p-3 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl text-center transition-all"
                  >
                    <span className="font-bold text-xs text-stone-800 block">Call Ringing</span>
                    <span className="text-[10px] text-stone-500">Incoming cadence</span>
                    {hapticTested === 'ring' && <span className="text-[10px] text-emerald-600 font-bold block mt-1 animate-pulse">Ringing ✓</span>}
                  </button>
                </div>
              </div>

              {/* Direct Telephony Intent */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                    Direct Telephony Dialer Intent (CALL_PHONE)
                  </h4>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">Direct Telephony Dialer Intent</span>
                    <span className="text-[10px] text-stone-500">Launches Android native phone dialer for customer callbacks</span>
                  </div>
                  <button
                    onClick={handleTestDialer}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Launch Dialer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SOURCE CODE INSPECTOR */}
          {activeTab === 'source' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {Object.entries(sourceFiles).map(([key, file]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSourceFile(key)}
                    className={`px-3 py-1.5 rounded-lg font-mono font-medium whitespace-nowrap transition-colors ${
                      selectedSourceFile === key
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {file.filename}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl bg-stone-950 text-stone-100 overflow-hidden border border-stone-800 shadow-inner">
                <div className="p-3 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs font-mono text-stone-400">
                  <span>{sourceFiles[selectedSourceFile].path}</span>
                  <button
                    onClick={() => copyToClipboard(sourceFiles[selectedSourceFile].content, selectedSourceFile)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-sans font-bold"
                  >
                    {copiedSection === selectedSourceFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === selectedSourceFile ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                  {sourceFiles[selectedSourceFile].content}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-stone-600 font-medium">
              Android Source in <code className="font-mono bg-stone-200 px-1 rounded text-stone-800">/android</code> • AAB Release Build Ready
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
