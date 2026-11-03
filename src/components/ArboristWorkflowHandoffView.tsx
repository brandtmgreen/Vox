import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  TreeDeciduous, 
  User, 
  Calendar, 
  FileText, 
  ArrowRight, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  Key,
  Dog,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { Lead } from '../types/crm';
import { haptics } from '../utils/haptics';
import { androidBridge } from '../utils/androidNativeBridge';

interface ArboristWorkflowHandoffViewProps {
  leads: Lead[];
  onSelectLead: (leadId: string) => void;
  onForwardLead?: (leadId: string, assignedEstimator: string, notes: string) => void;
}

export const ArboristWorkflowHandoffView: React.FC<ArboristWorkflowHandoffViewProps> = ({
  leads,
  onSelectLead,
  onForwardLead,
}) => {
  const [forwardedLeadIds, setForwardedLeadIds] = useState<Record<string, boolean>>({});
  const [assignedEstimators, setAssignedEstimators] = useState<Record<string, string>>({
    'LEAD-VOICE-8X92B': 'Brad Green (Lead Arborist)',
  });
  const [handoffSuccess, setHandoffSuccess] = useState<string | null>(null);

  const estimators = [
    'Brad Green (ISA Certified Arborist / Lead)',
    'Columbus East Field Estimator',
    'Columbus North / Midland Crew',
    'Phenix City & Russell County Team',
  ];

  const handleForwardClick = (leadId: string) => {
    haptics.success();
    setForwardedLeadIds((prev) => ({ ...prev, [leadId]: true }));
    const estimator = assignedEstimators[leadId] || 'Brad Green (ISA Certified Arborist / Lead)';
    setHandoffSuccess(`Lead ${leadId} successfully forwarded to GreenTree Arboriculture Management workflow! Assigned to: ${estimator}`);
    
    if (onForwardLead) {
      onForwardLead(leadId, estimator, 'Forwarded by Front Desk with full caller notes & access details.');
    }

    setTimeout(() => {
      setHandoffSuccess(null);
    }, 4000);
  };

  const handleEstimatorChange = (leadId: string, estimator: string) => {
    setAssignedEstimators((prev) => ({ ...prev, [leadId]: estimator }));
  };

  const handleDialCustomer = (phone: string) => {
    haptics.tap();
    androidBridge.launchDialer(phone);
  };

  const totalLeads = leads.length;
  const pendingHandoffCount = leads.filter((l) => !forwardedLeadIds[l.id] && l.status === 'LEAD').length;
  const forwardedCount = leads.filter((l) => forwardedLeadIds[l.id] || l.status !== 'LEAD').length;
  const urgentCount = leads.filter((l) => l.urgency === 'Emergency' || l.urgency === 'High').length;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5FA136]/15 text-[#376E20] flex items-center justify-center font-bold">
            <Send className="w-5 h-5 text-[#376E20]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-[#4D2809] text-base">
                GreenTree Arboriculture Management — Workflow Handoff
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5FA136]/15 text-[#376E20] uppercase tracking-wide">
                Front Desk Lead Queue
              </span>
            </div>
            <p className="text-xs text-stone-600 font-medium">
              Review caller data captured by front desk and forward qualified work orders directly to field arborists &amp; estimators
            </p>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 flex items-center gap-1.5">
            <span className="text-stone-500">Captured Leads:</span>
            <span className="font-bold">{totalLeads}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-amber-700">Ready to Forward:</span>
            <span className="font-bold">{pendingHandoffCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#5FA136]/15 text-[#376E20] border border-[#5FA136]/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5FA136]" />
            <span className="text-[#376E20]">Forwarded to Field:</span>
            <span className="font-bold">{forwardedCount}</span>
          </div>
        </div>
      </div>

      {/* Handoff Success Toast Notification */}
      {handoffSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{handoffSuccess}</span>
          </div>
          <button
            onClick={() => setHandoffSuccess(null)}
            className="text-emerald-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Role Boundary Guidance */}
      <div className="p-4 rounded-2xl bg-[#F9FAF6] border border-stone-200 text-xs text-stone-700 flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#376E20] text-white flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">
          ℹ️
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-[#4D2809] text-xs uppercase tracking-wider">
            Front Desk Operating Principle
          </h4>
          <p className="leading-relaxed">
            The front desk focuses on fast, accurate <strong>data capture and customer relationship intake</strong> from incoming phone calls and voicemails. All technical arboricultural assessments, tree risk scoring, and on-site safety procedures are carried out in person by GreenTree Arboriculture Management certified arborists upon receiving these forwarded files.
          </p>
        </div>
      </div>

      {/* Leads Workflow Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {leads.map((lead) => {
          const isForwarded = forwardedLeadIds[lead.id] || lead.status !== 'LEAD';
          const selectedEstimator = assignedEstimators[lead.id] || estimators[0];

          return (
            <div
              key={lead.id}
              className={`p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                isForwarded 
                  ? 'bg-white border-emerald-300 ring-1 ring-emerald-400/20' 
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="space-y-3">
                {/* Top card row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                        {lead.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.urgency === 'Emergency'
                          ? 'bg-rose-100 text-rose-800'
                          : lead.urgency === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {lead.urgency || 'Standard'} Priority
                      </span>
                      {isForwarded ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Forwarded to Field</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Ready for Handoff
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-base text-[#4D2809]">{lead.clientName}</h3>
                  </div>

                  <span className="font-black text-base text-[#376E20]">
                    ${(lead.estimatedValue || 1500).toLocaleString()}
                  </span>
                </div>

                {/* Contact & Address Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#F9FAF6] p-3 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-mono text-stone-800">{lead.phone}</span>
                    <button
                      onClick={() => handleDialCustomer(lead.phone)}
                      className="ml-auto text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100/60 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition-colors"
                      title="Direct phone dialer"
                    >
                      Call
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="text-stone-800 truncate" title={lead.address}>{lead.address}</span>
                  </div>
                </div>

                {/* Scope & Tree Details */}
                <div className="text-xs text-stone-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">Service Requested:</span>
                    <span className="px-2 py-0.5 rounded bg-stone-100 font-semibold text-stone-800">
                      {lead.serviceType}
                    </span>
                    <span className="text-stone-500">•</span>
                    <span className="text-stone-600">
                      {lead.treeCount || 1} {lead.treeSpecies?.[0] || 'Canopy Tree'}
                    </span>
                  </div>
                  <p className="text-stone-600 line-clamp-2 italic bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    "{lead.summary || 'Customer inquiry captured at front desk.'}"
                  </p>
                </div>

                {/* Property Access & Customer Site Notes */}
                <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-950 space-y-1">
                  <span className="font-bold text-[11px] block uppercase tracking-wider text-amber-900">
                    Front Desk Access &amp; Site Notes for Arborist:
                  </span>
                  <div className="text-[11px] text-amber-900/90 leading-tight">
                    {lead.hazards?.overhead ? (
                      <span className="block font-medium">⚡ Customer noted tree limbs near utility drop line.</span>
                    ) : null}
                    <span className="block">
                      • Gate/Access: Standard property access; owner requested advance notice prior to visit.
                    </span>
                    <span className="block">
                      • Pets/Dogs: Yard check requested before entry.
                    </span>
                  </div>
                </div>
              </div>

              {/* Handoff Actions & Estimator Assignment */}
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <label className="text-stone-500 font-medium">
                    Assign Field Estimator:
                  </label>
                  <select
                    value={selectedEstimator}
                    onChange={(e) => handleEstimatorChange(lead.id, e.target.value)}
                    disabled={isForwarded}
                    className="text-xs font-semibold bg-white border border-stone-200 rounded-lg p-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#5FA136]"
                  >
                    {estimators.map((est) => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => onSelectLead(lead.id)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Voice Transcript</span>
                  </button>

                  <button
                    onClick={() => handleForwardClick(lead.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                      isForwarded
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-[#376E20] hover:bg-[#2b5619] text-white active:scale-95'
                    }`}
                  >
                    {isForwarded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Re-send Handoff</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Forward to Arborist Workflow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
