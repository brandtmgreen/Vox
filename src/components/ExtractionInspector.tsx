import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  TreeDeciduous, 
  CheckCircle2, 
  Zap, 
  Home, 
  Car, 
  Droplet, 
  Mountain, 
  Dog, 
  Key, 
  Edit3, 
  Save, 
  X,
  Code,
  Copy,
  Check
} from 'lucide-react';
import { Voicemail, VoiceLeadIntakePayload } from '../types/crm';
import { ArbEAvatar } from './GreenTreeLogos';

interface ExtractionInspectorProps {
  voicemail: Voicemail;
  onUpdatePayload: (voicemailId: string, updatedPayload: VoiceLeadIntakePayload) => void;
}

export const ExtractionInspector: React.FC<ExtractionInspectorProps> = ({
  voicemail,
  onUpdatePayload,
}) => {
  const payload = voicemail.payload;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<VoiceLeadIntakePayload | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!payload) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center flex flex-col items-center justify-center h-full min-h-[320px]">
        <ArbEAvatar className="w-12 h-12 mb-3" />
        <h3 className="font-bold text-[#4D2809] text-base mb-1">Front Desk Intake Ready</h3>
        <p className="text-xs text-stone-600 max-w-sm mb-4">
          Click "Extract &amp; Ingest Lead" to parse customer contact details, service requested, and property access notes.
        </p>
      </div>
    );
  }

  const startEdit = () => {
    setEditForm({ ...payload });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editForm) {
      onUpdatePayload(voicemail.id, editForm);
      setIsEditing(false);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hazards = payload.hazards || {};

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 bg-[#F9FAF6] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ArbEAvatar className="w-8 h-8" />
          <div>
            <h3 className="font-bold text-sm text-[#4D2809]">Front Desk Data Capture (Arb-E)</h3>
            <p className="text-[11px] text-[#5FA136] font-semibold">Lead Qualification &amp; Workflow Forwarding</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonModal(!showJsonModal)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Inspect API Ingestion Payload (JSON)"
            aria-label="View JSON Payload"
          >
            <Code className="w-3.5 h-3.5 text-[#376E20]" />
            <span>JSON</span>
          </button>

          {!isEditing ? (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 transition-colors"
              aria-label="Edit arborist extraction details"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#376E20] hover:bg-[#2b5619] text-white shadow-2xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
        {/* Core Client Card */}
        {isEditing && editForm ? (
          <div className="space-y-3 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Client Full Name</label>
                <input
                  type="text"
                  value={editForm.clientName || ''}
                  onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-medium text-stone-900"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Service Address</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-medium text-stone-900"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.callerPhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, callerPhone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-medium text-stone-900"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-medium text-stone-900"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F9FAF6] border border-stone-200 flex items-start gap-3">
              <User className="w-4 h-4 text-[#376E20] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">Client Name</span>
                <span className="font-bold text-[#4D2809] text-sm block truncate">{payload.clientName || 'Caller'}</span>
                <span className="text-xs text-stone-600 font-mono">{payload.callerPhone}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F9FAF6] border border-stone-200 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#376E20] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">Service Address</span>
                <span className="font-bold text-[#4D2809] text-xs block leading-snug">{payload.address || 'Columbus, GA'}</span>
                <span className="text-[11px] text-stone-500 font-mono truncate block">{payload.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Arborist Service Classification */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Service</span>
            <span className="text-xs font-extrabold text-[#376E20] block">{payload.serviceType}</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Priority</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${
              payload.urgency === 'Emergency' ? 'bg-rose-100 text-rose-800 border-rose-300' :
              payload.urgency === 'High' ? 'bg-amber-50 text-amber-800 border-amber-200' :
              'bg-stone-100 text-stone-700 border-stone-200'
            }`}>
              {payload.urgency}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Tree Species</span>
            <span className="text-xs font-bold text-[#4D2809] block truncate">
              {payload.treeSpecies?.join(', ') || 'Canopy Tree'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Tree Count</span>
            <span className="text-xs font-bold text-[#4D2809] block">
              {payload.treeCount || 1} {payload.treeCount && payload.treeCount > 1 ? 'Trees' : 'Tree'}
            </span>
          </div>
        </div>

        {/* Executive Arborist Summary */}
        <div className="p-4 rounded-xl bg-[#5FA136]/10 border border-[#5FA136]/30">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#376E20] mb-1.5">
            <TreeDeciduous className="w-3.5 h-3.5 text-[#5FA136]" />
            <span>Arb-E Job Brief &amp; Triage Assessment</span>
          </div>
          <p className="text-xs sm:text-sm text-[#4D2809] leading-relaxed font-medium">
            {payload.aiSummary || payload.rawTranscript}
          </p>
        </div>

        {/* Front Desk Property & Site Notes (For Arborist On-Site Assessment) */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#376E20]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#4D2809]">
                Front Desk Property &amp; Site Notes
              </h4>
            </div>
            <span className="text-[10px] font-bold text-stone-500 uppercase bg-stone-100 px-2 py-0.5 rounded">
              Forward to Field Arborist
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {/* Overhead Wires */}
            <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
              hazards.overhead ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold' : 'bg-stone-50 border-stone-100 text-stone-400'
            }`}>
              <Zap className={`w-4 h-4 ${hazards.overhead ? 'text-amber-600' : 'text-stone-300'}`} />
              <span>Wires Noted: {hazards.overhead ? 'Yes' : 'None'}</span>
            </div>

            {/* Structures */}
            <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
              hazards.structures ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold' : 'bg-stone-50 border-stone-100 text-stone-400'
            }`}>
              <Home className={`w-4 h-4 ${hazards.structures ? 'text-amber-600' : 'text-stone-300'}`} />
              <span>Near Buildings: {hazards.structures ? 'Yes' : 'No'}</span>
            </div>

            {/* Traffic / Driveway */}
            <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
              hazards.traffic ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold' : 'bg-stone-50 border-stone-100 text-stone-400'
            }`}>
              <Car className={`w-4 h-4 ${hazards.traffic ? 'text-amber-600' : 'text-stone-300'}`} />
              <span>Street/Driveway: {hazards.traffic ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <p className="text-[11px] text-stone-600 bg-[#F9FAF6] p-2.5 rounded-lg border border-stone-100">
            <strong>Desk Note for Arborist:</strong> {hazards.overhead ? 'Customer mentioned limbs near utility drop. Field arborist should perform on-site distance check.' : 'Standard residential yard access.'}
          </p>
        </div>

        {/* Site Access & Pet Warnings */}
        {(payload.petAlerts || payload.accessNotes || payload.specialInstructions) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {payload.petAlerts && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Dog className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block">Pet / Animal Alert</span>
                  <p className="text-[11px]">{payload.petAlerts}</p>
                </div>
              </div>
            )}

            {(payload.accessNotes || payload.specialInstructions) && (
              <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-800 flex items-start gap-2.5">
                <Key className="w-4 h-4 text-[#376E20] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block">Gate &amp; Site Access</span>
                  <p className="text-[11px]">{payload.accessNotes || payload.specialInstructions}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real-time Ingestion Confirmation Banner */}
        <div className="p-3.5 rounded-xl bg-[#5FA136]/15 border border-[#5FA136]/40 flex items-center justify-between text-xs text-[#376E20]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#5FA136]" />
            <div>
              <span className="font-bold">GreenTree CRM &amp; Dispatch Ingested</span>
              <p className="text-[11px] text-[#4D2809]">
                Lead ID: {voicemail.leadId || 'LEAD-VOICE-DISPATCH'} • User: Arb-E Voice Agent
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-white px-2 py-1 rounded-md border border-[#5FA136]/30 font-bold text-[#376E20]">
            SYNCED
          </span>
        </div>
      </div>

      {/* JSON Payload Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-700 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#5FA136]" />
                <span className="font-bold text-xs font-mono text-[#A8D672]">
                  VoiceLeadIntakePayload (POST /api/leads/voice-intake)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyJson}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="p-1 rounded text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-400 bg-stone-950/80">
              <pre>{JSON.stringify(payload, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
