import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  Square, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  Home, 
  TreeDeciduous, 
  Dog, 
  Key, 
  Volume2, 
  VolumeX, 
  Clock, 
  ArrowRight,
  User,
  X
} from 'lucide-react';
import { 
  CallDialogueMessage, 
  CallProgressState, 
  VoiceLeadIntakePayload,
  JobStatus
} from '../types/crm';
import { ArbEAvatar } from './GreenTreeLogos';
import { 
  INITIAL_ARBE_GREETING, 
  createInitialCallState, 
  processCustomerCallTurn, 
  convertCallToVoiceLead 
} from '../utils/arborConversationEngine';
import { sendCallConversationTurn } from '../services/api';
import { audioPlayer } from '../utils/audioPlayer';

interface LiveInteractiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerPhone?: string;
  callerName?: string;
  onCallFinished: (payload: VoiceLeadIntakePayload) => void;
}

export const LiveInteractiveCallModal: React.FC<LiveInteractiveCallModalProps> = ({
  isOpen,
  onClose,
  callerPhone = '(706) 555-0144',
  callerName = 'David Patterson',
  onCallFinished,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'completed'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [dialogue, setDialogue] = useState<CallDialogueMessage[]>([]);
  const [callState, setCallState] = useState<CallProgressState>(createInitialCallState(callerPhone));
  const [inputText, setInputText] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [isArbESpeaking, setIsArbESpeaking] = useState(false);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(true);

  const durationTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize or reset when opened
  useEffect(() => {
    if (isOpen) {
      setCallStatus('ringing');
      setCallDuration(0);
      setDialogue([]);
      setCallState(createInitialCallState(callerPhone));
      setInputText('');

      audioPlayer.playIncomingRing();
      const secondRing = setTimeout(() => {
        audioPlayer.playIncomingRing();
      }, 2300);

      return () => {
        clearTimeout(secondRing);
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }
      };
    }
  }, [isOpen, callerPhone]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogue]);

  if (!isOpen) return null;

  /**
   * Speak Arb-E's lines using browser SpeechSynthesis if enabled
   */
  const speakArbEReply = (text: string) => {
    if (!voiceAudioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.lang.startsWith('en')) && !v.name.includes('Bad')
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    setIsArbESpeaking(true);
    utterance.onend = () => setIsArbESpeaking(false);
    utterance.onerror = () => setIsArbESpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Arb-E answers the phone live!
   */
  const handleAnswerCall = () => {
    setCallStatus('connected');
    audioPlayer.playArbEChime();

    // Start timer
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Initial greeting message from Arb-E
    const greetingMsg: CallDialogueMessage = {
      id: `msg-${Date.now()}`,
      speaker: 'arb-e',
      text: INITIAL_ARBE_GREETING,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDialogue([greetingMsg]);
    speakArbEReply(INITIAL_ARBE_GREETING);
  };

  /**
   * User sends a caller response (spoken or typed)
   */
  const handleSendTurn = async (messageText?: string) => {
    const textToSend = (messageText || inputText).trim();
    if (!textToSend) return;
    setInputText('');

    // Add caller message
    const callerMsg: CallDialogueMessage = {
      id: `msg-${Date.now()}`,
      speaker: 'caller',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newDialogue = [...dialogue, callerMsg];
    setDialogue(newDialogue);

    // Call conversational backend / engine
    try {
      const response = await sendCallConversationTurn({
        message: textToSend,
        currentState: callState,
        callerPhone,
        history: newDialogue,
      });

      const updated = response.updatedState;
      setCallState(updated);

      const arbEMsg: CallDialogueMessage = {
        id: `msg-${Date.now() + 1}`,
        speaker: 'arb-e',
        text: response.arbEReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        safetyAlert: response.isEmergencyAlert,
      };

      setDialogue([...newDialogue, arbEMsg]);
      speakArbEReply(response.arbEReply);

      if (response.isEmergencyAlert) {
        audioPlayer.playArbEChime();
      }

      // If call confirmed, finalize after brief pause
      if (updated.step === 'confirmed') {
        audioPlayer.playArbEChime();
        setTimeout(() => {
          handleFinishCall(updated, [...newDialogue, arbEMsg]);
        }, 3500);
      }
    } catch (err) {
      // Fallback to local conversation engine
      const turn = processCustomerCallTurn(textToSend, callState);
      setCallState(turn.updatedState);

      const arbEMsg: CallDialogueMessage = {
        id: `msg-${Date.now() + 1}`,
        speaker: 'arb-e',
        text: turn.arbEReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        safetyAlert: turn.isEmergencyAlert,
      };

      setDialogue([...newDialogue, arbEMsg]);
      speakArbEReply(turn.arbEReply);

      if (turn.updatedState.step === 'confirmed') {
        audioPlayer.playArbEChime();
        setTimeout(() => {
          handleFinishCall(turn.updatedState, [...newDialogue, arbEMsg]);
        }, 3500);
      }
    }
  };

  /**
   * Microphone speech recognition toggle
   */
  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Microphone speech-to-text is not supported in this browser. You can type or use the quick replies below.");
      return;
    }

    if (isListeningMic) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListeningMic(false);
      }
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          if (spoken) {
            handleSendTurn(spoken);
          }
          setIsListeningMic(false);
        };

        recognition.onerror = () => setIsListeningMic(false);
        recognition.onend = () => setIsListeningMic(false);

        recognition.start();
        recognitionRef.current = recognition;
        setIsListeningMic(true);
      } catch (err) {
        setIsListeningMic(false);
      }
    }
  };

  /**
   * Finalize call and dispatch to GreenTree CRM
   */
  const handleFinishCall = (stateToCommit?: CallProgressState, finalDialogue?: CallDialogueMessage[]) => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsArbESpeaking(false);

    const targetState = stateToCommit || callState;
    const historyList = finalDialogue || dialogue;
    const rawTranscript = historyList
      .map((m) => `${m.speaker === 'caller' ? 'Caller' : 'Arb-E'}: ${m.text}`)
      .join('\n');

    const leadPayload = convertCallToVoiceLead(targetState, rawTranscript);
    onCallFinished(leadPayload);
    setCallStatus('completed');
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#2D1B0A] text-white rounded-3xl border border-stone-700 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header Bar */}
        <div className="p-4 px-6 border-b border-stone-800 bg-[#231406] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArbEAvatar className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-[#A8D672] uppercase tracking-wider">
                  Arb-E Live Phone Assistant
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  callStatus === 'connected' ? 'bg-[#5FA136] text-white animate-pulse' :
                  callStatus === 'ringing' ? 'bg-amber-500 text-white animate-bounce' : 'bg-stone-700 text-stone-300'
                }`}>
                  {callStatus === 'connected' ? 'Live on Call' : callStatus === 'ringing' ? 'Incoming Ringing...' : 'Call Finished'}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Caller: {callerName} ({callerPhone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {callStatus === 'connected' && (
              <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>
                  {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            <button
              onClick={() => setVoiceAudioEnabled(!voiceAudioEnabled)}
              className="p-2 rounded-xl text-stone-400 hover:text-white bg-stone-900 hover:bg-stone-800 transition-colors"
              title={voiceAudioEnabled ? "Mute Arb-E voice audio" : "Enable Arb-E voice audio"}
              aria-label={voiceAudioEnabled ? "Mute Voice Audio" : "Enable Voice Audio"}
            >
              {voiceAudioEnabled ? <Volume2 className="w-4 h-4 text-[#A8D672]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close call interface"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ringing Screen */}
        {callStatus === 'ringing' && (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-[#5FA136]/20 flex items-center justify-center animate-ping absolute inset-0" />
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#376E20] to-[#5FA136] flex items-center justify-center relative shadow-xl shadow-[#5FA136]/30">
                <PhoneCall className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#A8D672] font-black block mb-1">
                Inbound Call Arriving
              </span>
              <h2 className="text-2xl font-black text-white">{callerName}</h2>
              <p className="text-sm text-stone-300 font-mono mt-0.5">{callerPhone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#376E20]/25 border border-[#5FA136]/40 max-w-md text-xs text-stone-200 text-left">
              <p className="font-bold text-[#A8D672] mb-1">🌲 Automated Arb-E Front Desk Receptionist:</p>
              <p className="leading-relaxed">
                Arb-E will answer this call live at the front desk, greet the customer, capture their contact &amp; tree service details, and queue the lead for GreenTree Arboriculture Management workflow handoff!
              </p>
            </div>

            <div className="flex items-center gap-4 w-full max-w-sm pt-2">
              <button
                onClick={handleAnswerCall}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#5FA136] hover:bg-[#528d2e] active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#5FA136]/40 transition-all"
                aria-label="Answer Call with Arb-E"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Answer Call with Arb-E</span>
              </button>
            </div>
          </div>
        )}

        {/* Connected Interactive Call Screen */}
        {callStatus === 'connected' && (
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left 7 Cols: Conversation Dialogue Stream */}
            <div className="md:col-span-7 flex flex-col border-r border-stone-800 bg-[#241505] overflow-hidden">
              {/* Arb-E Active Speaker Banner */}
              <div className="p-3 px-4 bg-[#1C1004] border-b border-stone-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🐒</span>
                  <span className="font-bold text-[#A8D672]">
                    {isArbESpeaking ? "Arb-E is speaking to customer..." : "Arb-E is listening..."}
                  </span>
                </div>
                {isArbESpeaking && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-3 bg-[#5FA136] rounded-full animate-pulse" />
                    <span className="w-1.5 h-5 bg-[#5FA136] rounded-full animate-pulse delay-75" />
                    <span className="w-1.5 h-2 bg-[#5FA136] rounded-full animate-pulse delay-150" />
                  </div>
                )}
              </div>

              {/* Chat Transcript Bubbles */}
              <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
                {dialogue.map((msg) => {
                  const isArbE = msg.speaker === 'arb-e';

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isArbE ? 'justify-start' : 'justify-end'}`}
                    >
                      {isArbE && <ArbEAvatar className="w-8 h-8 shrink-0 mt-0.5" />}

                      <div
                        className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          isArbE
                            ? msg.safetyAlert
                              ? 'bg-rose-950/80 border border-rose-600 text-rose-100 shadow-md'
                              : 'bg-[#376E20]/40 border border-[#5FA136]/40 text-stone-100'
                            : 'bg-stone-800 text-white ml-auto border border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1 text-[10px] text-stone-400">
                          <span className="font-bold text-stone-300">
                            {isArbE ? 'Arb-E (Voice Agent)' : callerName}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium">{msg.text}</p>
                      </div>

                      {!isArbE && (
                        <div className="w-8 h-8 rounded-full bg-stone-700 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Customer Test Prompts */}
              <div className="p-2.5 px-4 bg-[#1C1004] border-t border-stone-800 text-xs">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                  Simulate Caller Responses (or use Mic):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendTurn(`Hi Arb-E, this is ${callerName} at 412 River Road in Columbus.`)}
                    className="p-1.5 px-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium border border-stone-700"
                  >
                    👤 "I'm {callerName}, 412 River Road"
                  </button>
                  <button
                    onClick={() => handleSendTurn("A storm blew down a massive red oak limb hanging right over our power drop line and resting on the garage roof!")}
                    className="p-1.5 px-2.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-200 text-[11px] font-bold border border-rose-800"
                  >
                    ⚡ "Oak limb over power drop & garage roof!"
                  </button>
                  <button
                    onClick={() => handleSendTurn("Backyard gate latch is on the left, and we have two friendly dogs. Looking for someone today if possible.")}
                    className="p-1.5 px-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium border border-stone-700"
                  >
                    🐾 "Gate latch on left, 2 dogs, urgent today"
                  </button>
                </div>
              </div>

              {/* Caller Input Controls */}
              <div className="p-3 px-4 bg-[#2D1B0A] border-t border-stone-800 flex items-center gap-2">
                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListeningMic
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                  title={isListeningMic ? "Listening to your mic..." : "Speak into microphone"}
                  aria-label="Speak into microphone"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendTurn()}
                  placeholder={isListeningMic ? "Listening to your voice..." : "Speak or type customer reply..."}
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#5FA136]"
                />

                <button
                  onClick={() => handleSendTurn()}
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-[#5FA136] hover:bg-[#528d2e] disabled:opacity-40 text-white transition-colors"
                  aria-label="Send reply"
                >
                  <Send className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleFinishCall()}
                  className="px-3 py-2 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 ml-1 shrink-0"
                  title="End call and commit lead"
                  aria-label="End Call and Dispatch"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">End &amp; Dispatch</span>
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Real-Time CRM Extraction HUD */}
            <div className="md:col-span-5 p-5 bg-[#2A1909] flex flex-col justify-between overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
                  <div className="flex items-center gap-2">
                    <TreeDeciduous className="w-4 h-4 text-[#5FA136]" />
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-200">
                      Real-Time CRM Triage Checklist
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#A8D672] font-black bg-[#376E20]/40 px-2 py-0.5 rounded-md border border-[#5FA136]/30">
                    {callState.percentComplete}% Gathered
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-[#5FA136] to-[#A8D672] transition-all duration-300"
                    style={{ width: `${callState.percentComplete}%` }}
                  />
                </div>

                {/* Site Notes banner */}
                {callState.hazards.overhead && (
                  <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-600 text-xs text-amber-200 mb-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>UTILITY LINES NOTED NEAR CANOPY</span>
                    </div>
                    <p className="text-[10px] leading-tight text-amber-200">
                      Caller mentioned lines or storm damage. Flagged in customer file for on-site arborist inspection.
                    </p>
                  </div>
                )}

                {/* Checklist items */}
                <div className="space-y-2 text-xs">
                  {/* Client Name */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    callState.clientName ? 'bg-[#376E20]/20 border-[#5FA136]/40 text-stone-100' : 'bg-stone-900 border-stone-800 text-stone-500'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <User className={`w-3.5 h-3.5 ${callState.clientName ? 'text-[#A8D672]' : 'text-stone-600'}`} />
                      <span className="truncate">{callState.clientName || 'Caller Name'}</span>
                    </div>
                    {callState.clientName ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5FA136] shrink-0" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-stone-600">Pending</span>
                    )}
                  </div>

                  {/* Property Address */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    callState.address ? 'bg-[#376E20]/20 border-[#5FA136]/40 text-stone-100' : 'bg-stone-900 border-stone-800 text-stone-500'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <Home className={`w-3.5 h-3.5 ${callState.address ? 'text-[#A8D672]' : 'text-stone-600'}`} />
                      <span className="truncate">{callState.address || 'Service Address'}</span>
                    </div>
                    {callState.address ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5FA136] shrink-0" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-stone-600">Pending</span>
                    )}
                  </div>

                  {/* Service & Species */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    callState.serviceType ? 'bg-[#376E20]/20 border-[#5FA136]/40 text-stone-100' : 'bg-stone-900 border-stone-800 text-stone-500'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <TreeDeciduous className={`w-3.5 h-3.5 ${callState.serviceType ? 'text-[#A8D672]' : 'text-stone-600'}`} />
                      <span className="truncate">
                        {callState.serviceType ? `${callState.serviceType} (${callState.treeSpecies?.[0] || 'Tree'})` : 'Tree Work Needed'}
                      </span>
                    </div>
                    {callState.serviceType ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5FA136] shrink-0" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-stone-600">Pending</span>
                    )}
                  </div>

                  {/* Front Desk Site & Property Notes */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    callState.hazards.overhead || callState.hazards.structures ? 'bg-amber-950/40 border-amber-600/50 text-amber-200' : 'bg-stone-900 border-stone-800 text-stone-500'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <ShieldAlert className={`w-3.5 h-3.5 ${callState.hazards.overhead ? 'text-amber-400' : 'text-stone-400'}`} />
                      <span className="truncate">
                        {callState.hazards.overhead ? 'Wires Noted Nearby' : callState.hazards.structures ? 'Near House/Roof' : 'Site Notes Clean'}
                      </span>
                    </div>
                    {callState.hazards.overhead || callState.hazards.structures ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-stone-600">Assessing</span>
                    )}
                  </div>

                  {/* Access & Pets */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    callState.accessNotes || callState.petAlerts ? 'bg-[#376E20]/20 border-[#5FA136]/40 text-stone-100' : 'bg-stone-900 border-stone-800 text-stone-500'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <Dog className={`w-3.5 h-3.5 ${callState.petAlerts ? 'text-amber-400' : 'text-stone-600'}`} />
                      <span className="truncate">
                        {callState.accessNotes || callState.petAlerts || 'Gate Access & Pets'}
                      </span>
                    </div>
                    {callState.accessNotes || callState.petAlerts ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5FA136] shrink-0" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-stone-600">Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Commit Action */}
              <div className="pt-3 border-t border-stone-800 space-y-2">
                <button
                  onClick={() => handleFinishCall()}
                  className="w-full py-3 px-4 rounded-xl bg-[#5FA136] hover:bg-[#528d2e] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#5FA136]/30 transition-all"
                  aria-label="Commit and Dispatch Call Lead"
                >
                  <TreeDeciduous className="w-4 h-4" />
                  <span>Commit Lead &amp; Dispatch Arborist</span>
                </button>
                <p className="text-[10px] text-stone-400 text-center font-mono">
                  Syncs to GreenTree CRM • Triggers D5-A5 earcon chime
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Screen */}
        {callStatus === 'completed' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-full bg-[#5FA136]/20 text-[#5FA136] flex items-center justify-center border border-[#5FA136]/40 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#A8D672] font-black block mb-1">
                Call Handled Live by Arb-E 🐒
              </span>
              <h2 className="text-xl font-black text-white">Lead Successfully Captured at Front Desk!</h2>
              <p className="text-xs text-stone-300 max-w-md mt-1">
                Customer "{callState.clientName || callerName}" has been logged and queued for GreenTree Arboriculture Management field arborist workflow.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#376E20]/25 border border-[#5FA136]/30 max-w-sm w-full text-xs text-left space-y-1 text-stone-200">
              <div><strong>Client:</strong> {callState.clientName || callerName}</div>
              <div><strong>Service:</strong> {callState.serviceType || 'Tree Service'} ({callState.treeSpecies?.[0] || 'Tree'})</div>
              <div><strong>Address:</strong> {callState.address || 'Columbus, GA'}</div>
              <div><strong>Desk Notes:</strong> {callState.hazards.overhead ? '⚡ Tree near utility lines noted' : 'Standard property access'}</div>
            </div>

            <button
              onClick={onClose}
              className="py-3 px-6 rounded-xl bg-[#5FA136] hover:bg-[#528d2e] text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <span>View Ingested Lead on Dispatch Board</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
