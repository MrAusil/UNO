'use client';

import { SOUND_ENABLED_KEY } from '@/lib/constants';

type SoundType =
  | 'card_play'
  | 'card_draw'
  | 'player_join'
  | 'uno_call'
  | 'game_win'
  | 'turn_start'
  | 'error'
  | 'chat'
  | 'timer_low';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return this.audioContext;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): void {
    const ctx = this.getContext();
    if (!ctx || !this.enabled) return;

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio errors
    }
  }

  play(sound: SoundType): void {
    if (!this.enabled) return;

    switch (sound) {
      case 'card_play':
        this.playTone(440, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(550, 0.08, 'sine', 0.15), 80);
        break;

      case 'card_draw':
        this.playTone(300, 0.12, 'triangle', 0.2);
        break;

      case 'player_join':
        this.playTone(523, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 100);
        setTimeout(() => this.playTone(784, 0.15, 'sine', 0.2), 200);
        break;

      case 'uno_call':
        this.playTone(880, 0.05, 'square', 0.3);
        setTimeout(() => this.playTone(1100, 0.05, 'square', 0.3), 60);
        setTimeout(() => this.playTone(1320, 0.15, 'square', 0.3), 120);
        break;

      case 'game_win':
        const winNotes = [523, 659, 784, 1047];
        winNotes.forEach((note, i) => {
          setTimeout(() => this.playTone(note, 0.3, 'sine', 0.3), i * 120);
        });
        break;

      case 'turn_start':
        this.playTone(440, 0.08, 'sine', 0.15);
        break;

      case 'error':
        this.playTone(200, 0.2, 'sawtooth', 0.2);
        break;

      case 'chat':
        this.playTone(700, 0.08, 'sine', 0.1);
        break;

      case 'timer_low':
        this.playTone(440, 0.05, 'square', 0.15);
        break;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
