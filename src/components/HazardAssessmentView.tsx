import React from 'react';
import { 
  ShieldAlert, 
  Zap, 
  Home, 
  Car, 
  Droplet, 
  Mountain, 
  AlertTriangle, 
  TreeDeciduous, 
  MapPin, 
  Phone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Lead } from '../types/crm';

interface HazardAssessmentViewProps {
  leads: Lead[];
  onSelectLead: (leadId: string) => void;
}

export const HazardAssessmentView: React.FC<HazardAssessmentViewProps> = ({
  leads,
  onSelectLead,
}) => {
  const overheadLeads = leads.filter((l) => l.hazards?.overhead);
  const structureLeads = leads.filter((l) => l.hazards?.structures);
  const trafficLeads = leads.filter((l) => l.hazards?.traffic);
  const undergroundLeads = leads.filter((l) => l.hazards?.underground);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-[#4D2809] text-base">
              Job Safety &amp; Hazard Assessment (JSHA — ANSI Z133)
            </h2>
            <p className="text-xs text-stone-600 font-medium">
              Automated physical and electrical site hazard classification extracted from caller audio by Arb-E
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-rose-600" />
            <span>{overheadLeads.length} Power Line Incidents</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1.5">
            <Home className="w-4 h-4 text-amber-600" />
            <span>{structureLeads.length} Structural Targets</span>
          </span>
        </div>
      </div>

      {/* Electrical Wire Safety Warning Box */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-rose-950 shadow-2xs">
        <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm uppercase text-rose-950">
            Mandatory ANSI Z133 Electrical Minimum Approach Distances (MAD)
          </h3>
          <p className="leading-relaxed">
            All personnel, aerial lifts, and non-insulated rigging equipment must maintain strict clearance from energized electrical conductors. In Columbus, GA &amp; Phenix City, AL, report downed active lines to Georgia Power (1-888-891-0938) or Alabama Power (1-800-888-2726).
          </p>
        </div>
      </div>

      {/* Grid of Hazard Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category 1: Electrical & Overhead Wires */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-[#4D2809]">Overhead Electrical Conductors ({overheadLeads.length})</h3>
              </div>
              <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                High Risk
              </span>
            </div>

            <div className="space-y-2.5">
              {overheadLeads.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">No active power line hazards reported.</p>
              ) : (
                overheadLeads.map((lead) => (
                  <div key={lead.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/90 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#4D2809]">{lead.clientName}</span>
                      <span className="font-mono text-stone-500 text-[10px]">{lead.phone}</span>
                    </div>
                    <p className="text-stone-600 text-[11px] truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{lead.address}</span>
                    </p>
                    <p className="text-rose-900 font-medium text-[11px] bg-rose-50/80 p-1.5 rounded border border-rose-100">
                      ⚡ {lead.hazards?.details || 'Limbs touching electrical service drop'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Category 2: Structural Targets in Fall Zone */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-[#4D2809]">Structural Targets &amp; Roofs ({structureLeads.length})</h3>
              </div>
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Property Risk
              </span>
            </div>

            <div className="space-y-2.5">
              {structureLeads.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">No structural target hazards reported.</p>
              ) : (
                structureLeads.map((lead) => (
                  <div key={lead.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/90 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#4D2809]">{lead.clientName}</span>
                      <span className="font-mono text-stone-500 text-[10px]">{lead.phone}</span>
                    </div>
                    <p className="text-stone-600 text-[11px] truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{lead.address}</span>
                    </p>
                    <p className="text-amber-900 font-medium text-[11px] bg-amber-50/80 p-1.5 rounded border border-amber-100">
                      🏠 {lead.hazards?.details || 'Target structure in fall path'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
