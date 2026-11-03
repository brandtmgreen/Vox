import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Sparkles, 
  X, 
  TreeDeciduous, 
  AlertCircle,
  Zap,
  Volume2
} from 'lucide-react';
import { ArbEAvatar } from './GreenTreeLogos';

interface RecordVoicemailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitVoicemail: (transcript: string, callerPhone: string, callerName: string, audioBlob?: Blob) => Promise<void>;
  isProcessing: boolean;
}

export const RecordVoicemailModal: React.FC<RecordVoicemailModalProps> = ({
  isOpen,
  onClose,
  onSubmitVoicemail,
  isProcessing,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [callerPhone, setCallerPhone] = useState('(706) 555-0144');
  const [callerName, setCallerName] = useState('David Patterson');
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    setMicError(null);
    setTranscriptDraft('');
    setRecordDuration(0);
    audioChunksRef.current = [];

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + ' ';
          }
          setTranscriptDraft(current.trim());
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(250);
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          setRecordDuration((prev) => prev + 1);
        }, 1000);
      } else {
        throw new Error('Microphone not supported in this browser context');
      }
    } catch (err: any) {
      console.warn('Mic access error, allowing manual voice input:', err);
      setMicError('Microphone permission not granted. You can speak or use an arborist preset below.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleApplyPreset = (name: string, phone: string, presetText: string) => {
    setCallerName(name);
    setCallerPhone(phone);
    setTranscriptDraft(presetText);
  };

  const handleSubmit = async () => {
    if (!transcriptDraft.trim()) return;
    const audioBlob = audioChunksRef.current.length > 0 
      ? new Blob(audioChunksRef.current, { type: 'audio/webm' }) 
      : undefined;

    await onSubmitVoicemail(transcriptDraft, callerPhone, callerName, audioBlob);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-[#F9FAF6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ArbEAvatar className="w-9 h-9" />
            <div>
              <h3 className="font-extrabold text-[#4D2809] text-sm">Record Arborist Voicemail</h3>
              <p className="text-xs text-stone-500 font-medium">Speak into your mic to test Arb-E voice ingestion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Recording Box */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-center">
            {isRecording ? (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse mx-auto shadow-lg shadow-rose-200">
                  <Mic className="w-8 h-8" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold text-rose-600 font-mono text-sm">
                    Listening: {Math.floor(recordDuration / 60)}:{(recordDuration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  Arb-E transcribing speech in real-time...
                </p>
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold flex items-center gap-1.5 mx-auto transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Recording</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={startRecording}
                  className="w-14 h-14 rounded-full bg-[#376E20] hover:bg-[#2b5619] text-white flex items-center justify-center shadow-lg shadow-[#376E20]/20 mx-auto transition-transform active:scale-95"
                  aria-label="Start recording microphone"
                >
                  <Mic className="w-7 h-7" />
                </button>
                <p className="font-bold text-[#4D2809]">Tap to Start Speaking</p>
                <p className="text-stone-500 text-[11px] max-w-xs">
                  Leave a tree service request. Arb-E will transcribe details, check ANSI Z133 safety hazards, and update GreenTree CRM.
                </p>
              </div>
            )}
          </div>

          {micError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{micError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 font-semibold mb-1">Caller Name</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-stone-600 font-semibold mb-1">Caller Phone</label>
              <input
                type="text"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Voicemail Speech Transcript</label>
            <textarea
              rows={3}
              value={transcriptDraft}
              onChange={(e) => setTranscriptDraft(e.target.value)}
              placeholder="Your transcribed words will appear here, or pick a 1-click arborist scenario below..."
              className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#5FA136]/30 focus:outline-none"
            />
          </div>

          {/* Quick Arborist Presets (Section 7 of Spec) */}
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
              1-Click Spec Scenarios (Columbus &amp; Phenix City)
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    "David Patterson",
                    "(706) 555-0144",
                    "Hi, this is David Patterson at 412 River Road. We had a storm blow through last night and a massive red oak branch snapped. It's hanging directly over our power drop and resting on the garage roof. Please call me back at 706-555-0144. Gate latch on left."
                  )
                }
                className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 text-left transition-colors border border-rose-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">⚡ David Patterson (Emergency Storm Damage)</span>
                  <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">Z133 Power Drop</span>
                </div>
                <span className="text-[11px] text-rose-800 line-clamp-1 mt-0.5">Red oak snapped on garage roof over service drop</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    "Sarah Jenkins",
                    "(706) 555-0188",
                    "Hello Arb-E, this is Sarah Jenkins at 1420 Wynnton Rd in Columbus. I have three large live oaks with low dead branches touching my utility lines and driveway. Looking to get an ISA pruning estimate and canopy elevation."
                  )
                }
                className="w-full p-2.5 rounded-xl bg-[#5FA136]/10 hover:bg-[#5FA136]/20 text-[#376E20] text-left transition-colors border border-[#5FA136]/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">🌳 Sarah Jenkins (Live Oak Pruning)</span>
                  <span className="text-[10px] font-bold bg-[#5FA136]/20 text-[#376E20] px-1.5 py-0.5 rounded">3 Oaks</span>
                </div>
                <span className="text-[11px] text-[#4D2809] line-clamp-1 mt-0.5">Pruning estimate for 3 live oaks over utility line and driveway</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-[#F9FAF6] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!transcriptDraft.trim() || isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#376E20] hover:bg-[#2b5619] active:scale-95 text-white flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            aria-label="Process Voicemail and Ingest into GreenTree CRM"
          >
            <TreeDeciduous className="w-3.5 h-3.5" />
            <span>Process &amp; Ingest Lead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
