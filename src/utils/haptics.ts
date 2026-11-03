/**
 * Android Haptic Feedback Engine
 * Bridges to native Capacitor Haptics on Android devices with fallback to navigator.vibrate
 */
import { androidBridge } from './androidNativeBridge';

export const haptics = {
  tap: () => {
    androidBridge.haptics.tap();
  },

  medium: () => {
    androidBridge.haptics.medium();
  },

  success: () => {
    androidBridge.haptics.success();
  },

  hazardAlert: () => {
    androidBridge.haptics.hazardAlert();
  },

  callRing: () => {
    androidBridge.haptics.callRing();
  },

  stop: () => {
    androidBridge.haptics.stop();
  },
};
