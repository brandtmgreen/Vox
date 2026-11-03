import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { App as CapApp } from '@capacitor/app';

export interface AndroidDeviceInfo {
  isNative: boolean;
  platform: string;
  packageName: string;
  appName: string;
  version: string;
  buildNumber: string;
  targetSdk: string;
  permissions: {
    recordAudio: boolean;
    callPhone: boolean;
    vibrate: boolean;
    internet: boolean;
  };
}

export const androidBridge = {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  getPlatform(): string {
    return Capacitor.getPlatform();
  },

  async init(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setBackgroundColor({ color: '#064e3b' });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (e) {
        console.info('[Android Native] StatusBar setup in web container fallback');
      }

      try {
        CapApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapApp.exitApp();
          } else {
            window.history.back();
          }
        });
      } catch (e) {
        // Ignored on web
      }
    }
  },

  // Native Haptics
  haptics: {
    tap: async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
          return;
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(15); } catch (e) {}
      }
    },

    medium: async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
          return;
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(40); } catch (e) {}
      }
    },

    success: async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await Haptics.notification({ type: NotificationType.Success });
          return;
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([40, 60, 80]); } catch (e) {}
      }
    },

    hazardAlert: async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await Haptics.notification({ type: NotificationType.Error });
          await Haptics.vibrate({ duration: 500 });
          return;
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([150, 80, 150, 80, 250]); } catch (e) {}
      }
    },

    callRing: async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await Haptics.vibrate({ duration: 800 });
          return;
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([300, 200, 300, 200, 600]); } catch (e) {}
      }
    },

    stop: async () => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(0); } catch (e) {}
      }
    },
  },

  // Android Native Dialing Intent
  launchDialer(phoneNumber: string): void {
    const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleaned}`;
  },

  // Get current Android Environment information
  getNativeInfo(): AndroidDeviceInfo {
    return {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      packageName: 'com.greentree.arborlink',
      appName: 'GreenTree ArborLink',
      version: '1.0.0',
      buildNumber: '1001',
      targetSdk: 'Android 15 (API 35)',
      permissions: {
        recordAudio: true,
        callPhone: true,
        vibrate: true,
        internet: true,
      },
    };
  },
};
