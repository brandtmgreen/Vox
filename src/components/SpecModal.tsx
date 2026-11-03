import React from 'react';
import { FileCode, X, CheckCircle2, TreeDeciduous, ShieldAlert, Zap, Copy, Check } from 'lucide-react';
import { ArbEAvatar } from './GreenTreeLogos';

interface SpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecModal: React.FC<SpecModalProps> = ({ isOpen, onClose }) => {
  const [copiedCurl, setCopiedCurl] = React.useState(false);

  if (!isOpen) return null;

  const sampleCurl = `curl -X POST http://localhost:3000/api/leads/voice-intake \\
  -H "Content-Type: application/json" \\
  -H "X-Voice-API-Key: greentree-voice-secret" \\
  -d '{
    "callType": "VOICEMAIL",
    "callerPhone": "(706) 555-0144",
    "clientName": "David Patterson",
    "email": "dpatterson72@gmail.com",
    "address": "412 River Road, Columbus, GA 31904",
    "serviceType": "Emergency",
    "urgency": "Emergency",
    "rawTranscript": "Hi, this is David Patterson at 412 River Road. Storm cracked a massive red oak resting on garage roof and power drop.",
    "aiSummary": "Emergency storm damage: Heavy red oak limb snapped, resting on garage roof and hanging over main electrical service drop.",
    "treeSpecies": ["Southern Red Oak"],
    "treeCount": 1,
    "hazards": {
      "overhead": true,
      "structures": true
    }
  }'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-[#F9FAF6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArbEAvatar className="w-10 h-10" />
            <div>
              <h3 className="font-extrabold text-sm text-[#4D2809]">
                VOICE_AI_INTEGRATION_SPEC_e34f9f9d.md
              </h3>
              <p className="text-xs text-[#5FA136] font-bold">
                GreenTree Arboriculture Management • Version 1.0.0 Spec Blueprint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spec Contents */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-stone-700 leading-relaxed">
          {/* Section 1: Endpoints */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-[#376E20]" />
                <span>Endpoint 1: POST /api/leads/voice-intake</span>
              </span>
              <span className="text-[10px] font-bold bg-[#5FA136] text-white px-2 py-0.5 rounded">
                HTTP 201 Created
              </span>
            </div>
            <p className="text-[11px] text-stone-600">
              Ingests raw transcripts, caller IDs, property site notes, and pet alerts. Automatically deduplicates contacts by E.164 phone and queues leads for GreenTree Arboriculture Management field estimators.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-[#376E20]" />
                <span>Endpoint 2: POST /api/ai/transcribe</span>
              </span>
              <span className="text-[10px] font-bold bg-[#376E20] text-white px-2 py-0.5 rounded">
                Gemini 3.5 Transcribe
              </span>
            </div>
            <p className="text-[11px] text-stone-600">
              Accepts base64 encoded audio payloads for server-side audio transcription into verbatim arborist text.
            </p>
          </div>

          {/* Section 2: Arb-E Persona */}
          <div className="p-4 rounded-xl bg-[#5FA136]/10 border border-[#5FA136]/30 space-y-2">
            <div className="font-bold text-[#376E20] text-xs flex items-center gap-1.5">
              <span>🐒 Arb-E Earcon Chime &amp; Persona</span>
            </div>
            <p className="text-[11px] text-[#4D2809]">
              Two-tone earcon trigger on ingestion: <strong>D5 (587.33 Hz, 120ms)</strong> followed by <strong>A5 (880.00 Hz, 480ms exponential decay)</strong>.
            </p>
          </div>

          {/* Curl sample */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 text-[11px]">Ready-to-Test cURL Command:</span>
              <button
                onClick={copyCurl}
                className="flex items-center gap-1 px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] transition-colors"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[10px] overflow-x-auto">
              {sampleCurl}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
