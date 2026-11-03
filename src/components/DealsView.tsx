import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Voicemail as VoicemailIcon 
} from 'lucide-react';
import { Deal } from '../types/crm';

interface DealsViewProps {
  deals: Deal[];
  onUpdateDealStage: (dealId: string, newStage: Deal['stage']) => void;
  onSelectVoicemail: (vmId: string) => void;
}

const STAGES: Deal['stage'][] = [
  'New Lead',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Closed Won',
];

export const DealsView: React.FC<DealsViewProps> = ({
  deals,
  onUpdateDealStage,
  onSelectVoicemail,
}) => {
  const totalPipeline = deals.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Top Summary Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Deals Pipeline (Voicemail Originated)</h2>
            <p className="text-xs text-slate-600">Deals automatically initiated or boosted from customer voicemails</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
            Total Pipeline: <span className="font-extrabold text-sm ml-1">${totalPipeline.toLocaleString()}</span>
          </div>
          <div className="text-slate-600">
            {deals.length} Active Deals
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const stageSum = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage}
              className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200/80 flex flex-col min-h-[460px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="font-bold text-xs text-slate-800 truncate">{stage}</span>
                <span className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded-full border border-slate-200 text-slate-700 font-bold">
                  {stageDeals.length}
                </span>
              </div>
              <div className="text-[11px] text-slate-700 font-bold px-1 mb-3">
                ${stageSum.toLocaleString()}
              </div>

              {/* Deal Cards */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {stageDeals.length === 0 ? (
                  <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[11px] text-slate-600">
                    No deals in {stage}
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-slate-900 leading-snug">{deal.title}</h4>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5 truncate text-slate-700 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{deal.company}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{deal.contactName}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-extrabold text-sm text-emerald-700">
                          ${deal.value.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {deal.probability}% win
                        </span>
                      </div>

                      {/* Move Stage Selector & Voicemail Link */}
                      <div className="pt-2 flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => onSelectVoicemail(deal.sourceVoicemailId)}
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                          title="Listen to original source voicemail"
                        >
                          <VoicemailIcon className="w-3 h-3" />
                          <span>Audio</span>
                        </button>

                        <select
                          value={deal.stage}
                          onChange={(e) => onUpdateDealStage(deal.id, e.target.value as Deal['stage'])}
                          className="bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                          aria-label={`Update stage for ${deal.title}`}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              → {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
