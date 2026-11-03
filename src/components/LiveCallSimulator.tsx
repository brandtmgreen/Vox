import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneIncoming, 
  PhoneOff, 
  TreeDeciduous, 
  CheckCircle2, 
  Volume2, 
  Radio, 
  X, 
  User, 
  ArrowRight, 
  ShieldAlert,
  Zap
} from 'lucide-react';
import { audioPlayer } from '../utils/audioPlayer';
import { ArbEAvatar } from './GreenTreeLogos';

interface LiveCallSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onVoicemailCompleted: (transcript: string, callerPhone: string, callerName: string) => Promise<void>;
}

const INBOUND_SCENARIOS = [
  {
    callerName: 'David Patterson',
    phone: '(706) 555-0144',
    address: '412 River Road, Columbus, GA 31904',
    serviceType: 'Emergency',
    transcript: "Hi, this is David Patterson at 412 River Road. We had a storm blow through last night and a massive red oak branch snapped. It's hanging directly over our power drop and resting on the garage roof. Please call me back at 706-555-0144 as soon as someone is awake. We have a gate latch on the left.",
  },
  {
    callerName: 'Sarah Jenkins',
    phone: '(706) 555-0188',
    address: '1420 Wynnton Rd, Columbus, GA',
    serviceType: 'Pruning',
    transcript: "Hello Arb-E, this is Sarah Jenkins at 1420 Wynnton Rd in Columbus. I have three large live oaks with low dead branches touching my utility lines and driveway. Looking to get an ISA pruning estimate and canopy elevation.",
  },
  {
    callerName: 'Marcus Vance',
    phone: '(334) 555-0199',
    address: '802 Broad St, Phenix City, AL',
    serviceType: 'Removal',
    transcript: "Hey GreenTree team. This is Marcus Vance on 334-555-0199. Storm cracked a 50 foot loblolly pine in my backyard at 802 Broad St, Phenix City. It is leaning at 45 degrees towards the neighbor fence. Please get someone out today before the wind picks up.",
  }
];

export const LiveCallSimulator: React.FC<LiveCallSimulatorProps> = ({
  isOpen,
  onClose,
  onVoicemailCompleted,
}) => {
  const [stage, setStage] = useState<'greeting' | 'recording' | 'processing' | 'done'>('greeting');
  const [streamedText, setStreamedText] = useState('');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const streamTimerRef = useRef<any>(null);

  const scenario = INBOUND_SCENARIOS[scenarioIndex % INBOUND_SCENARIOS.length];

  useEffect(() => {
    if (isOpen) {
      setStage('greeting');
      setStreamedText('');
      audioPlayer.playIncomingRing();
      const ringTimer = setTimeout(() => {
        audioPlayer.playIncomingRing();
      }, 2400);

      return () => clearTimeout(ringTimer);
    } else {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    }
  }, [isOpen, scenarioIndex]);

  if (!isOpen) return null;

  const handleRouteToVoicemail = () => {
    setStage('recording');
    setStreamedText('');

    // Stream words to simulate caller speaking
    const words = scenario.transcript.split(' ');
    let wordIdx = 0;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(scenario.transcript);
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    }

    streamTimerRef.current = setInterval(() => {
      if (wordIdx < words.length) {
        setStreamedText((prev) => (prev ? prev + ' ' + words[wordIdx] : words[wordIdx]));
        wordIdx++;
      } else {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        finishCall();
      }
    }, 180);
  };

  const finishCall = async () => {
    setStage('processing');
    // Play official GreenTree arborist chime (D5-A5) on successful capture
    audioPlayer.playArbEChime();
    await onVoicemailCompleted(scenario.transcript, scenario.phone, scenario.callerName);
    setStage('done');
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#2D1B0A] text-white rounded-3xl border border-stone-700/80 shadow-2xl max-w-md w-full overflow-hidden p-6 animate-in fade-in zoom-in-95 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          aria-label="Close call simulator"
        >
          <X className="w-5 h-5" />
        </button>

        {stage === 'greeting' && (
          <div className="flex flex-col items-center text-center py-4 space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#5FA136]/20 flex items-center justify-center animate-ping absolute inset-0" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#376E20] to-[#5FA136] flex items-center justify-center relative shadow-lg shadow-[#5FA136]/30">
                <ArbEAvatar className="w-14 h-14" />
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#A8D672] font-black block mb-1">
                Arb-E IVR &amp; Voicemail Ingestion
              </span>
              <h3 className="text-xl font-black text-white">{scenario.callerName}</h3>
              <p className="text-xs text-stone-300 font-mono mt-0.5">{scenario.phone} • {scenario.address}</p>
            </div>

            {/* Arb-E Greeting Box (Section 2 of Spec) */}
            <div className="p-3.5 rounded-2xl bg-[#376E20]/30 border border-[#5FA136]/40 text-left text-xs leading-relaxed text-stone-200">
              <span className="font-bold text-[#A8D672] flex items-center gap-1.5 text-[11px] mb-1">
                <span>🐒 Arb-E Greeting:</span>
              </span>
              <p className="italic text-[11px] text-stone-300">
                "You’ve reached GreenTree Arboriculture. We're currently aloft in the canopy or assisting a neighbor on site! Please leave your property address, and a brief description of the tree work needed — especially if power lines or buildings are close by..."
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={handleRouteToVoicemail}
                className="flex-1 py-3 px-4 rounded-xl bg-[#5FA136] hover:bg-[#528d2e] active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#5FA136]/30 transition-all"
                aria-label="Caller leaves voicemail"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Caller Leaves Voicemail</span>
              </button>
            </div>

            <div className="flex items-center justify-between w-full text-[11px] text-stone-400 pt-2 border-t border-stone-800">
              <span>Next Test Scenario:</span>
              <button
                onClick={() => setScenarioIndex((prev) => prev + 1)}
                className="text-[#A8D672] hover:underline font-bold"
              >
                Switch Caller →
              </button>
            </div>
          </div>
        )}

        {stage === 'recording' && (
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold text-xs text-rose-400 font-mono uppercase">
                  Arb-E Transcribing Voicemail...
                </span>
              </div>
              <span className="text-xs font-mono text-stone-400">{scenario.phone}</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-700 min-h-[160px] flex flex-col justify-between">
              <p className="text-sm leading-relaxed text-stone-200">
                {streamedText || "Listening to caller..."}
                <span className="inline-block w-2 h-4 bg-[#5FA136] animate-pulse ml-1 align-middle" />
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-stone-800 mt-3">
                <span>Caller: {scenario.callerName}</span>
                <button
                  onClick={finishCall}
                  className="text-xs text-[#A8D672] hover:text-white font-bold"
                >
                  Fast Forward →
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 'processing' && (
          <div className="py-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#5FA136]/20 border border-[#5FA136]/40 flex items-center justify-center text-[#5FA136]">
              <TreeDeciduous className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Arb-E Capturing Data &amp; Generating Lead</h3>
              <p className="text-xs text-stone-400 max-w-xs mt-1">
                Parsing caller details, requested service, property access notes, and queuing for workflow handoff...
              </p>
            </div>
          </div>
        )}

        {stage === 'done' && (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#5FA136]/20 text-[#5FA136] flex items-center justify-center border border-[#5FA136]/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Lead Ingested into GreenTree CRM!</h3>
              <p className="text-xs text-stone-300 max-w-xs mt-1">
                Arb-E generated Lead for "{scenario.callerName}" ready for GreenTree Arboriculture Management workflow handoff.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-[#5FA136] hover:bg-[#528d2e] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all mt-4"
            >
              <span>View Ingested Lead &amp; Workflow Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
