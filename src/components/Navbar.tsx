import React from 'react';
import { 
  PhoneCall, 
  Mic, 
  ShieldAlert, 
  Users, 
  TrendingUp, 
  Activity, 
  Inbox, 
  PlusCircle, 
  Radio,
  FileCode,
  TreeDeciduous,
  Zap,
  Smartphone
} from 'lucide-react';
import { GreenTreeCanopyIcon, ArbEAvatar } from './GreenTreeLogos';

export type NavTab = 'inbox' | 'leads' | 'contacts' | 'hazards' | 'audit';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  voicemailCount: number;
  leadCount: number;
  contactCount: number;
  hazardCount: number;
  pipelineTotal: number;
  onOpenLiveCall: () => void;
  onSimulateCall: () => void;
  onOpenRecorder: () => void;
  onIngestSample: () => void;
  onOpenSpecModal: () => void;
  onOpenApkModal?: () => void;
  isProcessing: boolean;
  autoAnswerEnabled?: boolean;
  onToggleAutoAnswer?: () => void;
  isAndroidView?: boolean;
  onToggleAndroidView?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  voicemailCount,
  leadCount,
  contactCount,
  hazardCount,
  pipelineTotal,
  onOpenLiveCall,
  onSimulateCall,
  onOpenRecorder,
  onIngestSample,
  onOpenSpecModal,
  onOpenApkModal,
  isProcessing,
  autoAnswerEnabled = true,
  onToggleAutoAnswer,
  isAndroidView = false,
  onToggleAndroidView,
}) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner & Mascot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Arb-E */}
        <div className="flex items-center gap-3">
          <ArbEAvatar className="w-11 h-11" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-[#4D2809]">
                GREENTREE
              </span>
              <span className="font-extrabold text-xs tracking-widest text-[#5FA136] bg-[#5FA136]/10 px-2 py-0.5 rounded-md uppercase">
                ARBORICULTURE
              </span>
              <button
                onClick={onToggleAutoAnswer}
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                  autoAnswerEnabled
                    ? 'bg-[#5FA136]/15 text-[#376E20] border-[#5FA136]/40 hover:bg-[#5FA136]/25'
                    : 'bg-stone-100 text-stone-500 border-stone-300'
                }`}
                title="Click to toggle Arb-E Auto-Answer vs traditional Voicemail"
              >
                <span className={`w-2 h-2 rounded-full ${autoAnswerEnabled ? 'bg-[#5FA136] animate-ping' : 'bg-stone-400'}`} />
                <span>Auto-Answer Phone: {autoAnswerEnabled ? 'ON (Arb-E)' : 'OFF'}</span>
              </button>
            </div>
            <p className="text-xs text-stone-600 font-medium hidden sm:block">
              Columbus, GA &amp; Phenix City, AL • ISA Certified Arborists • Safety Standard ANSI Z133
            </p>
          </div>
        </div>

        {/* Live Metrics Quick Bar */}
        <div className="hidden lg:flex items-center gap-5 text-xs text-stone-600 bg-[#F9FAF6] py-1.5 px-4 rounded-xl border border-stone-200">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Est. Pipeline</span>
            <span className="font-bold text-[#376E20] text-sm">${pipelineTotal.toLocaleString()}</span>
          </div>
          <div className="w-px h-6 bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Z133 Hazards</span>
            <span className="font-bold text-amber-700 text-sm flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {hazardCount} Active
            </span>
          </div>
          <div className="w-px h-6 bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Voice Answering</span>
            <span className="font-bold text-[#5FA136] text-sm">Arb-E 🐒 Live Conversational</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Main Answer Live Call Button */}
          <button
            onClick={onOpenLiveCall}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#376E20] to-[#5FA136] hover:from-[#2e5d1b] hover:to-[#528d2e] active:scale-95 text-white shadow-md shadow-[#5FA136]/25 transition-all disabled:opacity-50 ring-2 ring-[#5FA136]/30"
            title="Arb-E answers the phone live and talks to the customer to gather info & advance CRM workflow"
            aria-label="Answer Phone with Arb-E"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>Answer Call (Arb-E)</span>
          </button>

          {/* Record Live Audio Button */}
          <button
            onClick={onOpenRecorder}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-stone-50 text-[#4D2809] border border-stone-300 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            title="Record a voicemail simulation"
            aria-label="Record Voicemail with Mic"
          >
            <Mic className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Record Audio</span>
          </button>

          {/* Quick Ingest Demo Sample */}
          <button
            onClick={onIngestSample}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#5FA136]/15 hover:bg-[#5FA136]/25 text-[#376E20] transition-colors disabled:opacity-50"
            title="Ingest arborist storm damage or pruning inquiry"
            aria-label="Add Demo Voicemail"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#5FA136]" />
            <span className="hidden md:inline">Voice Scenario</span>
          </button>

          {/* Android Phone View Simulator Toggle */}
          {onToggleAndroidView && (
            <button
              onClick={onToggleAndroidView}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                isAndroidView
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
              title={isAndroidView ? "Switch to Full Operations Workspace View" : "Switch to Simulated Android Native Phone View"}
              aria-label="Toggle Android Device View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAndroidView ? 'Full View' : 'Pixel Frame'}</span>
            </button>
          )}

          {/* Android Native Hub (Capacitor & Studio APK) */}
          {onOpenApkModal && (
            <button
              onClick={onOpenApkModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
              title="Android Native App Hub: Capacitor Project, APK Build, Studio Files & Hardware Sensors"
              aria-label="Android Native Hub"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Android Native Hub</span>
              <span className="sm:hidden">Android</span>
            </button>
          )}

          {/* View Spec Contract Button */}
          <button
            onClick={onOpenSpecModal}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            title="View VOICE_AI_INTEGRATION_SPEC blueprint contract"
            aria-label="View VOICE AI Integration Spec"
          >
            <FileCode className="w-4 h-4 text-[#376E20]" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-100">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none" aria-label="CRM Sections">
          <button
            onClick={() => onTabChange('inbox')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'inbox'
                ? 'bg-[#5FA136]/15 text-[#376E20]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Voice Pipeline &amp; Audio Player</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'inbox' ? 'bg-[#5FA136] text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {voicemailCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('leads')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'leads'
                ? 'bg-[#5FA136]/15 text-[#376E20]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <TreeDeciduous className="w-4 h-4 text-[#5FA136]" />
            <span>Operations Dispatch &amp; Leads</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'leads' ? 'bg-[#5FA136] text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {leadCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('contacts')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'contacts'
                ? 'bg-[#5FA136]/15 text-[#376E20]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>GreenTree Contacts Directory</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'contacts' ? 'bg-[#5FA136] text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {contactCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('hazards')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'hazards'
                ? 'bg-amber-100 text-amber-900'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>ANSI Z133 Hazards (JSHA)</span>
            {hazardCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {hazardCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('audit')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'audit'
                ? 'bg-[#5FA136]/15 text-[#376E20]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Arb-E Activity Ledger</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
