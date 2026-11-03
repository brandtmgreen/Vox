/**
 * Web Audio and Speech Synthesis helper for GreenTree Arboriculture
 * Implements Arb-E voice greetings, emergency safety dialogues, and the official D5-A5 arborist earcon chime
 */

class ArborAudioEngine {
  private isPlaying: boolean = false;
  private durationSeconds: number = 0;
  private currentTime: number = 0;
  private timerInterval: any = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  /**
   * Official GreenTree two-tone arborist chime (Section 1 of spec):
   * Tone 1: D5 (587.33 Hz), duration 120ms
   * Tone 2: A5 (880.00 Hz), duration 480ms exponential decay
   */
  public playArbEChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Tone 1: D5 (587.33 Hz), 120ms
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Tone 2: A5 (880.00 Hz), starts at now + 0.12s, 480ms decay
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880.00, now + 0.12);
      gain2.gain.setValueAtTime(0.14, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.60);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.60);
    } catch (e) {
      // AudioContext could be blocked prior to user interaction
    }
  }

  public playIncomingRing() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.8);
      osc2.stop(ctx.currentTime + 1.8);
    } catch (e) {
      // ignore
    }
  }

  public play(
    transcript: string,
    durationSeconds: number,
    onTimeUpdate: (time: number) => void,
    onEnded: () => void,
    playbackRate: number = 1.0
  ) {
    this.stop();

    this.durationSeconds = durationSeconds;
    this.currentTime = 0;
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
    this.isPlaying = true;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.rate = playbackRate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const warmVoice = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.lang.startsWith('en')) && !v.name.includes('Bad')
      );
      if (warmVoice) {
        utterance.voice = warmVoice;
      }

      utterance.onend = () => {
        this.stop();
        if (this.onEndedCallback) this.onEndedCallback();
      };

      utterance.onerror = () => {
        this.stop();
        if (this.onEndedCallback) this.onEndedCallback();
      };

      window.speechSynthesis.speak(utterance);
    }

    const intervalMs = 200;
    this.timerInterval = setInterval(() => {
      this.currentTime += (intervalMs / 1000) * playbackRate;
      if (this.currentTime >= this.durationSeconds) {
        this.currentTime = this.durationSeconds;
        this.stop();
        if (this.onEndedCallback) this.onEndedCallback();
      } else if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime);
      }
    }, intervalMs);
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resume(playbackRate: number = 1.0) {
    if (this.currentTime >= this.durationSeconds) {
      this.currentTime = 0;
    }
    this.isPlaying = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }

    const intervalMs = 200;
    this.timerInterval = setInterval(() => {
      this.currentTime += (intervalMs / 1000) * playbackRate;
      if (this.currentTime >= this.durationSeconds) {
        this.currentTime = this.durationSeconds;
        this.stop();
        if (this.onEndedCallback) this.onEndedCallback();
      } else if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime);
      }
    }, intervalMs);
  }

  public seek(targetSeconds: number) {
    this.currentTime = Math.max(0, Math.min(targetSeconds, this.durationSeconds));
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioPlayer = new ArborAudioEngine();
