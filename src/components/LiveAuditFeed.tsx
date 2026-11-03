import React from 'react';
import { 
  Activity as ActivityIcon, 
  TreeDeciduous, 
  PhoneIncoming, 
  Users, 
  ShieldAlert, 
  Clock, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Activity } from '../types/crm';
import { ArbEAvatar } from './GreenTreeLogos';

interface LiveAuditFeedProps {
  logs: Activity[];
}

export const LiveAuditFeed: React.FC<LiveAuditFeedProps> = ({ logs }) => {
  const getTypeBadge = (type: Activity['type']) => {
    switch (type) {
      case 'LEAD':
        return 'bg-[#5FA136]/15 text-[#376E20] border-[#5FA136]/30';
      case 'JOB':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'DRONE':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'FINANCE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'SYSTEM':
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <ArbEAvatar className="w-10 h-10" />
          <div>
            <h2 className="font-extrabold text-[#4D2809] text-base">Arb-E Voice Operations Ledger</h2>
            <p className="text-xs text-stone-500 font-medium">
              Live audit trail of call recordings, ANSI Z133 hazard classifications, and CRM dispatches
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#376E20] bg-[#5FA136]/15 px-3 py-1 rounded-full border border-[#5FA136]/30">
          <span className="w-2 h-2 rounded-full bg-[#5FA136] animate-pulse" />
          <span>Arb-E Listening</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {logs.map((log) => {
          const isEmergency = log.message.toLowerCase().includes('emergency') || log.message.toLowerCase().includes('power');

          return (
            <div
              key={log.id}
              className={`p-3.5 rounded-xl border transition-colors flex items-start gap-3 text-xs ${
                isEmergency 
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
                  : 'bg-[#F9FAF6] border-stone-200/80 hover:bg-stone-100/60 text-stone-800'
              }`}
            >
              <div className="p-2 rounded-lg bg-white border border-stone-200 shrink-0 shadow-2xs">
                {isEmergency ? (
                  <Zap className="w-4 h-4 text-rose-600" />
                ) : (
                  <TreeDeciduous className="w-4 h-4 text-[#376E20]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#4D2809] text-xs">{log.user}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTypeBadge(log.type)}`}>
                      {log.type}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="leading-relaxed text-[11px] font-medium">
                  {log.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
