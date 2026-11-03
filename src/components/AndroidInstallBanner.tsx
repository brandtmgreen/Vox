import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Share2, 
  Sparkles, 
  ShieldCheck,
  Star,
  ExternalLink
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { haptics } from '../utils/haptics';

interface AndroidInstallBannerProps {
  onOpenApkModal: () => void;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  onOpenApkModal,
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already installed or dismissed, do not show banner
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    haptics.tap();
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else {
      // Open the Android installation & APK guide modal
      onOpenApkModal();
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white px-4 py-2.5 shadow-md border-b border-emerald-700/50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: App Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-emerald-400/30">
            <img src="/icon.svg" alt="GreenTree ArborLink" className="w-full h-full object-contain" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-emerald-50 truncate">
                GreenTree Front Desk App
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-700/80 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                PWA / TWA Ready
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/90 hidden sm:block truncate">
              Install directly to your Android home screen with offline sync, haptics &amp; instant call answering
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{installing ? 'Installing...' : isInstallable ? 'Install App' : 'Add to Android'}</span>
          </button>

          <button
            onClick={onOpenApkModal}
            className="hidden lg:flex items-center gap-1 bg-white/10 hover:bg-white/20 text-emerald-100 text-xs px-2.5 py-1.5 rounded-xl border border-white/10 transition-colors"
            title="Download APK / Google Play Setup"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
            <span>APK &amp; Play Store</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
