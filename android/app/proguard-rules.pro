# GreenTree ArborLink - ProGuard / R8 Optimization Rules for Google Play Store
# Preserves Capacitor, WebKit JavaScript interfaces, and AndroidX native bridges

# 1. Capacitor Core & Plugins
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class com.greentree.arborlink.** { *; }
-keep public class * extends com.getcapacitor.Plugin

# 2. JavaScript Interface preservation for WebView
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 3. AndroidX SplashScreen & AppCompat
-keep class androidx.core.splashscreen.** { *; }
-dontwarn androidx.core.splashscreen.**
-keep class androidx.appcompat.** { *; }

# 4. Retain attributes for Google Play Vitals / Crashlytics stack trace demangling
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses,EnclosingMethod

# 5. Cordova / Capacitor Plugins Reflection
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**
