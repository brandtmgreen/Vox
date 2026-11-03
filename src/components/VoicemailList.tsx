import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  TreeDeciduous, 
  PhoneIncoming, 
  MapPin 
} from 'lucide-react';
import { Voicemail } from '../types/crm';

interface VoicemailListProps {
  voicemails: Voicemail[];
  selectedVoicemailId: string;
  onSelectVoicemail: (id: string) => void;
  onOpenLiveCall?: (caller?: { name: string; phone: string }) => void;
}

export const VoicemailList: React.FC<VoicemailListProps> = ({
  voicemails,
  selectedVoicemailId,
  onSelectVoicemail,
  onOpenLiveCall,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'emergency' | 'synced' | 'pending'>('all');

  const filtered = voicemails.filter((vm) => {
    const q = searchQuery.toLowerCase().trim();
    const payload = vm.payload;
    const nameMatch = (vm.callerCallerIdName || '').toLowerCase().includes(q);
    const phoneMatch = vm.callerNumber.toLowerCase().includes(q);
    const addressMatch = (payload?.address || '').toLowerCase().includes(q);
    const speciesMatch = (payload?.treeSpecies || []).some((s) => s.toLowerCase().includes(q));
    const transcriptMatch = vm.transcript.toLowerCase().includes(q);

    if (q && !nameMatch && !phoneMatch && !addressMatch && !speciesMatch && !transcriptMatch) {
      return false;
    }

    if (filterType === 'emergency') {
      return payload?.urgency === 'Emergency' || payload?.hazards?.overhead || vm.emergencyAlertTriggered;
    }
    if (filterType === 'synced') return vm.synced;
    if (filterType === 'pending') return !vm.synced;

    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Header & Search */}
      <div className="p-4 border-b border-stone-100 bg-[#F9FAF6] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneIncoming className="w-4 h-4 text-[#376E20]" />
            <h2 className="font-extrabold text-sm text-[#4D2809]">Voice Ingestion Queue</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenLiveCall && (
              <button
                onClick={() => onOpenLiveCall()}
                className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#5FA136] hover:bg-[#528d2e] text-white shadow-2xs transition-all flex items-center gap-1"
                title="Test Arb-E answering a live call instead of voicemail"
              >
                <span>Answer Call (Arb-E)</span>
              </button>
            )}
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#5FA136]/15 text-[#376E20]">
              {filtered.length} calls
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by caller, address, species, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5FA136]/30 focus:border-[#5FA136]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-[#376E20] text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All ({voicemails.length})
          </button>
          <button
            onClick={() => setFilterType('emergency')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              filterType === 'emergency'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            🚨 Priority Leads
          </button>
          <button
            onClick={() => setFilterType('synced')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              filterType === 'synced'
                ? 'bg-[#376E20] text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Synced ({voicemails.filter((v) => v.synced).length})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto divide-y divide-stone-100 flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            No voice inquiries match the selected filter.
          </div>
        ) : (
          filtered.map((vm) => {
            const isSelected = vm.id === selectedVoicemailId;
            const payload = vm.payload;
            const isEmergency = payload?.urgency === 'Emergency' || vm.emergencyAlertTriggered;
            const hasOverhead = payload?.hazards?.overhead;

            return (
              <div
                key={vm.id}
                onClick={() => onSelectVoicemail(vm.id)}
                className={`p-3.5 transition-all cursor-pointer select-none text-left flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#5FA136]/10 border-l-4 border-l-[#376E20] shadow-2xs'
                    : 'hover:bg-stone-50 border-l-4 border-l-transparent'
                }`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isEmergency ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  vm.synced ? 'bg-[#5FA136]/20 text-[#376E20]' : 'bg-stone-200 text-stone-700'
                }`}>
                  {vm.callerCallerIdName ? vm.callerCallerIdName.slice(0, 2).toUpperCase() : '🌲'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-extrabold text-[#4D2809] text-xs truncate">
                      {vm.callerCallerIdName || vm.callerNumber}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 shrink-0">
                      {new Date(vm.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {payload?.address && (
                    <div className="text-[11px] font-medium text-stone-500 truncate flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{payload.address}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-700 line-clamp-2 leading-relaxed mb-1.5 font-medium">
                    {payload?.aiSummary || vm.transcript}
                  </p>

                  {/* Badges footer */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="flex items-center gap-1 text-stone-500 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {vm.audioDurationFormatted}
                    </span>

                    {payload?.serviceType && (
                      <span className={`px-1.5 py-0.5 rounded-sm font-bold border ${
                        isEmergency ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-[#5FA136]/15 text-[#376E20] border-[#5FA136]/30'
                      }`}>
                        {payload.serviceType}
                      </span>
                    )}

                    {hasOverhead && (
                      <span className="px-1.5 py-0.5 rounded-sm font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 text-amber-600" />
                        <span>Wires</span>
                      </span>
                    )}

                    {vm.synced ? (
                      <span className="ml-auto flex items-center gap-0.5 text-[#376E20] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-[#5FA136]" />
                        <span>Synced</span>
                      </span>
                    ) : (
                      <span className="ml-auto text-amber-700 font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
