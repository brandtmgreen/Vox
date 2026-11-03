import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Smartphone, 
  Monitor, 
  Share2, 
  QrCode,
  RotateCcw
} from 'lucide-react';
import { haptics } from '../utils/haptics';

interface AndroidFrameProps {
  children: React.ReactNode;
  isAndroidView: boolean;
  onToggleView: () => void;
  onOpenApkModal: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isAndroidView,
  onToggleView,
  onOpenApkModal,
}) => {
  const [currentTime, setCurrentTime] = useState('1:52');
  const [isNativeMobile, setIsNativeMobile] = useState(false);

  useEffect(() => {
    // Check if user is already on a real mobile device or standalone mode
    const checkNative = () => {
      const isMobileWidth = window.innerWidth < 768;
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsNativeMobile(isMobileWidth || isStandalone);
    };

    checkNative();
    window.addEventListener('resize', checkNative);

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
          .replace(/ AM| PM/i, '')
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);

    return () => {
      window.removeEventListener('resize', checkNative);
      clearInterval(timer);
    };
  }, []);

  // If already on a real mobile screen or installed PWA, render full screen directly
  if (isNativeMobile || !isAndroidView) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        {/* Floating Toggle Bar for Desktop Preview */}
        {!isNativeMobile && (
          <div className="bg-stone-900 text-stone-200 px-4 py-2 flex items-center justify-between text-xs border-b border-stone-800 shadow-sm z-30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-white">GreenTree ArborLink Operations Hub</span>
              <span className="text-stone-400">|</span>
              <span className="text-emerald-400 font-mono text-[11px]">Android PWA &amp; TWA Enabled</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  haptics.tap();
                  onToggleView();
                }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg transition-colors shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simulate Android Phone (Pixel 8)</span>
              </button>

              <button
                onClick={onOpenApkModal}
                className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors"
              >
                <span>APK &amp; Play Store Guide</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    );
  }

  // Simulated Android Device Mode (Google Pixel 8 Pro aesthetic)
  return (
    <div className="min-h-screen bg-stone-950 py-8 px-4 flex flex-col items-center justify-center">
      {/* Top Controls Bar */}
      <div className="max-w-md w-full mb-4 flex items-center justify-between text-stone-300 text-xs px-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-700 p-1 flex items-center justify-center">
            <img src="/icon.svg" alt="GreenTree" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-white">Google Pixel 8 Pro Simulator</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tap();
              onToggleView();
            }}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-white/10"
          >
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch to Desktop View</span>
          </button>
          
          <button
            onClick={onOpenApkModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-xs"
          >
            APK Setup
          </button>
        </div>
      </div>

      {/* Android Phone Chassis */}
      <div className="relative w-full max-w-[420px] h-[860px] bg-stone-900 rounded-[52px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[5px] border-stone-800 ring-1 ring-white/10 flex flex-col">
        {/* Antenna bands */}
        <div className="absolute top-28 -left-[7px] w-[2px] h-6 bg-stone-700 rounded-l"></div>
        <div className="absolute top-44 -left-[7px] w-[2px] h-12 bg-stone-700 rounded-l"></div>
        <div className="absolute top-36 -right-[7px] w-[2px] h-14 bg-stone-700 rounded-r"></div>

        {/* Screen Bezel & Display */}
        <div className="relative w-full h-full bg-stone-50 rounded-[42px] overflow-hidden flex flex-col shadow-inner">
          {/* Android Status Bar */}
          <div className="h-10 bg-emerald-950 text-white px-6 flex items-center justify-between text-xs select-none z-50 shrink-0">
            {/* Left: Time */}
            <span className="font-semibold tracking-tight text-[13px]">{currentTime}</span>

            {/* Center: Punch-hole Camera */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-stone-700/80 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-900"></div>
            </div>

            {/* Right: Android System Icons */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-mono text-[10px] font-bold text-emerald-300">5G</span>
              <Signal className="w-3.5 h-3.5 text-white" />
              <Wifi className="w-3.5 h-3.5 text-white" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono">98%</span>
                <Battery className="w-4 h-4 text-emerald-400 rotate-90" />
              </div>
            </div>
          </div>

          {/* Internal App Viewport */}
          <div className="flex-1 overflow-y-auto relative flex flex-col bg-stone-100">
            {children}
          </div>

          {/* Android Navigation Bar (Bottom Gesture Bar) */}
          <div className="h-4 bg-white/95 backdrop-blur-xs flex items-center justify-center shrink-0 z-50">
            <div className="w-32 h-1 bg-stone-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Simulator Caption */}
      <p className="mt-3 text-stone-500 text-xs text-center">
        Android PWA &amp; TWA preview • Touch responsive • ANSI Z133 Real-time Safety Triage
      </p>
    </div>
  );
};
