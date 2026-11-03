import React from 'react';
import { PhoneCall, Sparkles } from 'lucide-react';
import { ArbEAvatar } from './GreenTreeLogos';
import { haptics } from '../utils/haptics';

interface AndroidFloatingCallButtonProps {
  onOpenLiveCall: () => void;
  isProcessing?: boolean;
}

export const AndroidFloatingCallButton: React.FC<AndroidFloatingCallButtonProps> = ({
  onOpenLiveCall,
  isProcessing,
}) => {
  const handleClick = () => {
    haptics.tap();
    onOpenLiveCall();
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
      <button
        onClick={handleClick}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white pl-3.5 pr-4 py-3 rounded-2xl shadow-xl shadow-emerald-950/20 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30 focus:outline-hidden"
        aria-label="Answer Call with Arb-E AI"
      >
        {/* Pulse glow effect */}
        <span className="absolute -inset-0.5 rounded-2xl bg-emerald-400 opacity-30 group-hover:opacity-60 blur-xs transition duration-300 animate-pulse"></span>

        {/* Arb-E Avatar Mini */}
        <div className="relative">
          <ArbEAvatar className="w-8 h-8" />
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full"></span>
        </div>

        <div className="relative flex flex-col text-left">
          <div className="flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span className="text-xs font-black tracking-wide uppercase text-amber-200">Arb-E Phone</span>
          </div>
          <span className="text-[11px] font-medium text-emerald-100 leading-tight">Answer / Intake</span>
        </div>
      </button>
    </div>
  );
};
