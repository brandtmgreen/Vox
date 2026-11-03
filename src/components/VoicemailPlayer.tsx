import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw,
  FileText,
  Zap,
  Volume2,
  TreeDeciduous,
  ShieldAlert
} from 'lucide-react';
import { Voicemail } from '../types/crm';
import { AudioWaveform } from './AudioWaveform';
import { audioPlayer } from '../utils/audioPlayer';
import { formatAudioDuration } from '../utils/crmSyncEngine';

interface VoicemailPlayerProps {
  voicemail: Voicemail;
  onProcessVoicemail: (vm: Voicemail) => void;
  isProcessing: boolean;
  onSelectLead?: (leadId: string) => void;
}

export const VoicemailPlayer: React.FC<VoicemailPlayerProps> = ({
  voicemail,
  onProcessVoicemail,
  isProcessing,
  onSelectLead,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  useEffect(() => {
    audioPlayer.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  }, [voicemail.id]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioPlayer.pause();
      setIsPlaying(false);
    } else {
      if (currentTime === 0 || currentTime >= voicemail.durationSeconds) {
        audioPlayer.play(
          voicemail.transcript,
          voicemail.durationSeconds,
          (time) => setCurrentTime(time),
          () => {
            setIsPlaying(false);
            setCurrentTime(0);
          },
          playbackRate
        );
      } else {
        audioPlayer.resume(playbackRate);
      }
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    audioPlayer.seek(newTime);
  };

  const handleSkip = (delta: number) => {
    const target = Math.max(0, Math.min(currentTime + delta, voicemail.durationSeconds));
    handleSeek(target);
  };

  const handleSpeedChange = () => {
    const rates = [1.0, 1.25, 1.5];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (isPlaying) {
      audioPlayer.stop();
      audioPlayer.play(
        voicemail.transcript,
        voicemail.durationSeconds,
        (time) => setCurrentTime(time),
        () => {
          setIsPlaying(false);
          setCurrentTime(0);
        },
        nextRate
      );
    }
  };

  const payload = voicemail.payload;
  const isEmergency = payload?.urgency === 'Emergency' || voicemail.emergencyAlertTriggered;
  const hasOverheadHazard = payload?.hazards?.overhead;

  const activeSegmentIndex = voicemail.transcriptSegments.findIndex((_, idx) => {
    const segCount = voicemail.transcriptSegments.length;
    if (segCount === 0) return false;
    const segDuration = voicemail.durationSeconds / segCount;
    const start = idx * segDuration;
    const end = (idx + 1) * segDuration;
    return currentTime >= start && currentTime < end;
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header Info */}
      <div className="p-4 sm:p-5 border-b border-stone-100 bg-[#F9FAF6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#376E20]/10 border border-[#376E20]/30 flex items-center justify-center font-bold text-[#376E20] text-sm">
            {voicemail.callerCallerIdName ? voicemail.callerCallerIdName.slice(0, 2).toUpperCase() : '🌲'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#4D2809] text-base">
                {voicemail.callerCallerIdName || voicemail.callerNumber}
              </h2>
              {payload?.serviceType && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  payload.serviceType === 'Emergency' 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-[#5FA136]/15 text-[#376E20] border-[#5FA136]/30'
                }`}>
                  {payload.serviceType}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span className="font-mono">{voicemail.callerNumber}</span>
              <span>•</span>
              <span>{payload?.address || 'Columbus, GA'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                {voicemail.audioDurationFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Status Badge & Action */}
        <div className="flex items-center gap-2">
          {payload?.urgency && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              payload.urgency === 'Emergency'
                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                : payload.urgency === 'High'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}>
              {payload.urgency} Urgency
            </span>
          )}

          {voicemail.synced ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>CRM Synced</span>
            </div>
          ) : (
            <button
              onClick={() => onProcessVoicemail(voicemail)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#376E20] hover:bg-[#2b5619] text-white shadow-xs transition-all disabled:opacity-50"
              aria-label="Process Voicemail and Ingest into GreenTree CRM"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Arb-E Parsing...</span>
                </>
              ) : (
                <>
                  <TreeDeciduous className="w-3.5 h-3.5" />
                  <span>Extract &amp; Ingest Lead</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Priority Customer Note Banner */}
      {(isEmergency || hasOverheadHazard) && (
        <div className="bg-amber-50 border-y border-amber-200 p-3 px-5 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold uppercase tracking-wide text-amber-950 block">
              Front Desk Note: Utility / Structure Contact Mentioned
            </span>
            <p className="leading-snug">
              Caller noted tree branches near utility wires or structures. Flagged for field arborist on-site assessment upon dispatch.
            </p>
          </div>
        </div>
      )}

      {/* Audio Player Control Section */}
      <div className="p-4 sm:p-5 border-b border-stone-100 bg-white">
        <div className="flex items-center gap-3 mb-2">
          {/* Main Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="w-11 h-11 rounded-full bg-[#376E20] hover:bg-[#2b5619] active:scale-95 text-white flex items-center justify-center shadow-md shadow-[#376E20]/20 transition-all shrink-0"
            aria-label={isPlaying ? "Pause Voicemail Audio" : "Play Voicemail Audio"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Skip buttons */}
          <button
            onClick={() => handleSkip(-10)}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            title="Rewind 10 seconds"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSkip(10)}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            title="Fast forward 10 seconds"
            aria-label="Fast forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Waveform Scrubber */}
          <div className="flex-1 min-w-0">
            <AudioWaveform
              durationSeconds={voicemail.durationSeconds}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onSeek={handleSeek}
              height={44}
            />
          </div>

          {/* Time indicator */}
          <div className="text-xs font-mono font-medium text-stone-600 shrink-0 select-none">
            {formatAudioDuration(currentTime)} / {voicemail.audioDurationFormatted}
          </div>

          {/* Speed switcher */}
          <button
            onClick={handleSpeedChange}
            className="px-2 py-1 rounded-md text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors shrink-0"
            title="Toggle playback speed"
            aria-label={`Playback speed: ${playbackRate}x`}
          >
            {playbackRate}x
          </button>

          {/* Arb-E Chime Button */}
          <button
            onClick={() => audioPlayer.playArbEChime()}
            className="p-2 rounded-lg text-[#5FA136] hover:bg-[#5FA136]/10 transition-colors shrink-0"
            title="Play official Arb-E D5-A5 earcon chime"
            aria-label="Play Arb-E Earcon Chime"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Synchronized Transcript View */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#376E20]" />
            <h3 className="font-bold text-sm text-[#4D2809]">Synchronized Caller Transcript</h3>
          </div>
          <span className="text-[11px] text-[#376E20] bg-[#5FA136]/15 px-2.5 py-0.5 rounded-full font-mono font-semibold">
            Arb-E Confidence: {voicemail.confidenceScore}%
          </span>
        </div>

        <div className="space-y-3">
          {voicemail.transcriptSegments && voicemail.transcriptSegments.length > 0 ? (
            voicemail.transcriptSegments.map((seg, idx) => {
              const isActive = idx === activeSegmentIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    const segDuration = voicemail.durationSeconds / voicemail.transcriptSegments.length;
                    handleSeek(idx * segDuration);
                  }}
                  className={`p-3 rounded-xl transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#5FA136]/10 border-[#5FA136] shadow-xs'
                      : 'bg-stone-50/70 hover:bg-stone-100/70 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#4D2809]">{seg.speaker}</span>
                    <span className="font-mono text-stone-500 text-[11px]">{seg.timestamp}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isActive ? 'text-[#376E20] font-semibold' : 'text-stone-700'}`}>
                    {seg.text}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700 leading-relaxed">
              {voicemail.transcript}
            </div>
          )}
        </div>
      </div>

      {/* Footer link to Lead */}
      {voicemail.leadId && onSelectLead && (
        <div className="px-5 py-3 bg-[#F9FAF6] border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <span>Ingested as GreenTree Lead: <strong className="font-mono text-[#376E20]">{voicemail.leadId}</strong></span>
          <button
            onClick={() => onSelectLead(voicemail.leadId!)}
            className="font-bold text-[#376E20] hover:underline flex items-center gap-1"
          >
            <span>View Dispatch Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
