import React from 'react';
import { 
  TreeDeciduous, 
  MapPin, 
  Phone, 
  Zap, 
  Clock, 
  ShieldAlert, 
  Voicemail as VoicemailIcon, 
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Lead, JobStatus } from '../types/crm';

interface LeadsBoardProps {
  leads: Lead[];
  onUpdateLeadStatus: (leadId: string, newStatus: JobStatus) => void;
  onSelectVoicemailByLead: (leadId: string) => void;
}

const STAGES: { key: JobStatus; label: string }[] = [
  { key: 'LEAD', label: '1. Voice Lead Ingested' },
  { key: 'ESTIMATE_SCHEDULED', label: '2. Estimate Scheduled' },
  { key: 'IN_PROGRESS', label: '3. Crew in Canopy / Working' },
  { key: 'COMPLETED', label: '4. Job Completed' },
  { key: 'INVOICED', label: '5. Invoiced & Closed' },
];

export const LeadsBoard: React.FC<LeadsBoardProps> = ({
  leads,
  onUpdateLeadStatus,
  onSelectVoicemailByLead,
}) => {
  const totalValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 1500), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5FA136]/15 text-[#376E20] flex items-center justify-center font-bold">
            <TreeDeciduous className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-[#4D2809] text-base">
              GreenTree Operations &amp; Dispatch Board
            </h2>
            <p className="text-xs text-stone-600 font-medium">
              Real-time pipeline of tree service inquiries ingested by Arb-E Voice Agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="bg-[#5FA136]/15 text-[#376E20] px-3.5 py-1.5 rounded-xl border border-[#5FA136]/30">
            Active Pipeline: <span className="font-black text-sm ml-1">${totalValue.toLocaleString()}</span>
          </div>
          <div className="text-stone-600">
            {leads.length} Leads Active
          </div>
        </div>
      </div>

      {/* Kanban Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          const stageTotal = stageLeads.reduce((acc, l) => acc + (l.estimatedValue || 1500), 0);

          return (
            <div
              key={stage.key}
              className="bg-stone-100/70 p-3 rounded-2xl border border-stone-200/90 flex flex-col min-h-[460px]"
            >
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="font-bold text-xs text-[#4D2809] truncate">{stage.label}</span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full border border-stone-200 text-stone-700 font-bold">
                  {stageLeads.length}
                </span>
              </div>
              <div className="text-[11px] text-[#376E20] font-bold px-1 mb-3">
                ${stageTotal.toLocaleString()} est.
              </div>

              {/* Cards */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="h-28 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center text-[11px] text-stone-400">
                    No leads in stage
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const isEmergency = lead.urgency === 'Emergency';
                    const hasOverhead = lead.hazards?.overhead;

                    return (
                      <div
                        key={lead.id}
                        className={`bg-white p-3.5 rounded-xl border transition-all text-xs space-y-2 shadow-2xs hover:shadow-sm ${
                          isEmergency ? 'border-rose-300 ring-1 ring-rose-200' : 'border-stone-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-extrabold text-[#4D2809] leading-tight text-sm">
                            {lead.clientName}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            isEmergency 
                              ? 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse' 
                              : 'bg-[#5FA136]/15 text-[#376E20] border-[#5FA136]/30'
                          }`}>
                            {lead.serviceType}
                          </span>
                        </div>

                        <div className="space-y-1 text-stone-600 text-[11px]">
                          <div className="flex items-center gap-1.5 font-medium truncate">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                            <span className="truncate">{lead.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        </div>

                        {/* Species & Tree count */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#376E20] font-semibold bg-[#F9FAF6] p-2 rounded-lg border border-stone-100">
                          <TreeDeciduous className="w-3.5 h-3.5 text-[#5FA136] shrink-0" />
                          <span className="truncate">
                            {lead.treeCount || 1} {lead.treeSpecies?.[0] || 'Tree'}
                          </span>
                        </div>

                        {/* Hazards badge if present */}
                        {hasOverhead && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <Zap className="w-3 h-3" />
                            <span>ANSI Z133: Power Lines</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <span className="font-black text-sm text-[#376E20]">
                            ${(lead.estimatedValue || 1500).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {lead.id}
                          </span>
                        </div>

                        {/* Stage Selector */}
                        <div className="pt-2 flex items-center justify-between text-[11px]">
                          <button
                            onClick={() => onSelectVoicemailByLead(lead.id)}
                            className="text-[#376E20] hover:text-[#2b5619] flex items-center gap-1 font-bold"
                            title="Listen to original voice recording"
                          >
                            <VoicemailIcon className="w-3 h-3" />
                            <span>Audio</span>
                          </button>

                          <select
                            value={lead.status}
                            onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as JobStatus)}
                            className="bg-stone-50 border border-stone-200 text-stone-700 font-semibold rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                            aria-label={`Update stage for ${lead.clientName}`}
                          >
                            {STAGES.map((s) => (
                              <option key={s.key} value={s.key}>
                                → {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
