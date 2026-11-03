import React, { useMemo } from 'react';

interface AudioWaveformProps {
  durationSeconds: number;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  height?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  durationSeconds,
  currentTime,
  isPlaying,
  onSeek,
  height = 48,
}) => {
  // Deterministic seed waveform pattern based on duration so each voicemail looks distinct
  const barCount = 48;
  const bars = useMemo(() => {
    const list = [];
    for (let i = 0; i < barCount; i++) {
      // Natural speech rhythm wave modulation
      const t = i / barCount;
      const base = 0.2 + 0.6 * Math.sin(t * Math.PI * 4) * Math.cos(t * Math.PI * 2);
      const noise = ((i * 17) % 23) / 46;
      const normalizedHeight = Math.max(0.15, Math.min(0.95, base * 0.7 + noise * 0.4));
      list.push(normalizedHeight);
    }
    return list;
  }, [durationSeconds]);

  const progressFraction = durationSeconds > 0 ? currentTime / durationSeconds : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(fraction * durationSeconds);
  };

  return (
    <div
      onClick={handleClick}
      role="slider"
      aria-label="Audio scrubber waveform"
      aria-valuemin={0}
      aria-valuemax={durationSeconds}
      aria-valuenow={currentTime}
      tabIndex={0}
      className="relative flex items-center gap-[3px] py-2 px-3 rounded-lg bg-slate-900/5 hover:bg-slate-900/10 transition-colors cursor-pointer select-none group w-full"
      style={{ height: `${height}px` }}
    >
      {bars.map((bar, index) => {
        const barFraction = index / barCount;
        const isPast = barFraction <= progressFraction;
        const barHeightPx = Math.max(6, Math.round(bar * (height - 16)));

        return (
          <div
            key={index}
            className="flex-1 flex items-center justify-center h-full"
          >
            <div
              style={{ height: `${barHeightPx}px` }}
              className={`w-full rounded-full transition-all duration-100 ${
                isPast
                  ? 'bg-indigo-600 shadow-sm'
                  : 'bg-slate-300 group-hover:bg-slate-400'
              } ${isPlaying && isPast && index === Math.floor(progressFraction * barCount) ? 'scale-y-125 bg-indigo-500' : ''}`}
            />
          </div>
        );
      })}

      {/* Progress cursor */}
      <div
        className="absolute top-1 bottom-1 w-[2px] bg-indigo-600 pointer-events-none rounded transition-all duration-75"
        style={{ left: `calc(${progressFraction * 100}% + 4px)` }}
      />
    </div>
  );
};
