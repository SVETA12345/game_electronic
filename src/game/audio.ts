import { SoundEvent } from './types';
import zastavkaUrl from '../audio/zastavka.mp3';
import winningUrl from '../audio/winning.mp3';
import lossUrl from '../audio/loss.mp3';

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

const MUSIC_VOLUME = 0.2;
const ENDING_VOLUME = 0.65;

export class SoundPlayer {
  private context: AudioContext | null = null;
  private music: HTMLAudioElement | null = null;
  private winAudio: HTMLAudioElement | null = null;
  private lossAudio: HTMLAudioElement | null = null;
  private musicActive = false;
  private winActive = false;
  private lossActive = false;
  private enabled = true;

  setEnabled(value: boolean) {
    this.enabled = value;
    if (!value) {
      if (this.context && this.context.state === 'running') {
        void this.context.suspend();
      }
      this.music?.pause();
      this.winAudio?.pause();
      this.lossAudio?.pause();
      return;
    }
    this.playWinMusic();
    this.playLossMusic();
    this.playMusic();
  }

  startMusic() {
    this.stopWinMusic();
    this.stopLossMusic();
    this.musicActive = true;
    const music = this.getMusic();
    if (!music) {
      return;
    }
    music.currentTime = 0;
    this.playMusic();
  }

  resumeMusic() {
    this.musicActive = true;
    this.playMusic();
  }

  pauseMusic() {
    this.musicActive = false;
    this.music?.pause();
  }

  stopMusic() {
    this.musicActive = false;
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
    this.stopWinMusic();
    this.stopLossMusic();
  }

  unlock() {
    if (!this.enabled) {
      return;
    }
    this.getContext();
    this.playWinMusic();
    this.playLossMusic();
    this.playMusic();
  }

  play(event: SoundEvent) {
    if (!this.enabled) {
      return;
    }

    switch (event) {
      case 'catch':
        this.tone(740, 0.07, 'square', 0.045);
        this.tone(988, 0.08, 'square', 0.035, 0.045);
        break;
      case 'gold':
        this.tone(784, 0.08, 'triangle', 0.05);
        this.tone(988, 0.08, 'triangle', 0.05, 0.07);
        this.tone(1318, 0.14, 'triangle', 0.045, 0.14);
        break;
      case 'miss':
        this.tone(320, 0.14, 'square', 0.06, 0, 210);
        this.tone(210, 0.2, 'sawtooth', 0.05, 0.08, 110);
        break;
      case 'goldmiss':
        this.tone(880, 0.1, 'triangle', 0.045, 0, 660);
        break;
      case 'bomb':
        this.tone(150, 0.28, 'square', 0.06, 0, 55);
        this.tone(74, 0.32, 'sawtooth', 0.05, 0.02, 36);
        break;
      case 'level':
        this.tone(523, 0.09, 'square', 0.04);
        this.tone(659, 0.09, 'square', 0.04, 0.09);
        this.tone(784, 0.16, 'square', 0.04, 0.18);
        break;
      case 'start':
        this.tone(392, 0.1, 'square', 0.04);
        this.tone(523, 0.1, 'square', 0.04, 0.1);
        this.tone(784, 0.16, 'square', 0.04, 0.2);
        break;
      case 'win':
        this.startWinMusic();
        break;
      case 'gameover':
        this.startLossMusic();
        break;
      default:
        break;
    }
  }

  private startWinMusic() {
    this.stopMusic();
    this.winActive = true;
    const winAudio = this.getWinAudio();
    if (!winAudio) {
      return;
    }
    winAudio.currentTime = 0;
    this.playWinMusic();
  }

  private stopWinMusic() {
    this.winActive = false;
    if (!this.winAudio) {
      return;
    }
    this.winAudio.pause();
    this.winAudio.currentTime = 0;
  }

  private playWinMusic() {
    if (!this.enabled || !this.winActive) {
      return;
    }
    const winAudio = this.getWinAudio();
    if (!winAudio || !winAudio.paused) {
      return;
    }
    void winAudio.play().catch(() => {});
  }

  private startLossMusic() {
    this.stopMusic();
    this.lossActive = true;
    const lossAudio = this.getLossAudio();
    if (!lossAudio) {
      return;
    }
    lossAudio.currentTime = 0;
    this.playLossMusic();
  }

  private stopLossMusic() {
    this.lossActive = false;
    if (!this.lossAudio) {
      return;
    }
    this.lossAudio.pause();
    this.lossAudio.currentTime = 0;
  }

  private playLossMusic() {
    if (!this.enabled || !this.lossActive) {
      return;
    }
    const lossAudio = this.getLossAudio();
    if (!lossAudio || !lossAudio.paused) {
      return;
    }
    void lossAudio.play().catch(() => {});
  }

  private playMusic() {
    if (!this.enabled || !this.musicActive) {
      return;
    }
    const music = this.getMusic();
    if (!music || !music.paused) {
      return;
    }
    void music.play().catch(() => {});
  }

  private getMusic(): HTMLAudioElement | null {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!this.music) {
      this.music = new Audio(zastavkaUrl);
      this.music.loop = true;
      this.music.preload = 'auto';
      this.music.volume = MUSIC_VOLUME;
    }
    return this.music;
  }

  private getWinAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!this.winAudio) {
      this.winAudio = new Audio(winningUrl);
      this.winAudio.preload = 'auto';
      this.winAudio.volume = ENDING_VOLUME;
      this.winAudio.addEventListener('ended', () => {
        this.winActive = false;
      });
    }
    return this.winAudio;
  }

  private getLossAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!this.lossAudio) {
      this.lossAudio = new Audio(lossUrl);
      this.lossAudio.preload = 'auto';
      this.lossAudio.volume = ENDING_VOLUME;
      this.lossAudio.addEventListener('ended', () => {
        this.lossActive = false;
      });
    }
    return this.lossAudio;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (this.context) {
      if (this.context.state === 'suspended') {
        void this.context.resume();
      }
      return this.context;
    }

    const AudioCtor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AudioCtor) {
      return null;
    }

    this.context = new AudioCtor();
    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
    return this.context;
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
    endFrequency?: number,
  ) {
    const context = this.getContext();
    if (!context) {
      return;
    }

    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(24, endFrequency), start + duration);
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }
}
