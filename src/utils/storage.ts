import { BEST_SCORE_KEY, BEST_SCORE_KEYS, MODE_KEY } from '../game/constants';
import type { GameMode } from '../game/types';

const readNumber = (key: string) => {
  if (typeof window === 'undefined') {
    return 0;
  }
  try {
    const stored = window.localStorage.getItem(key);
    const parsed = stored ? Number.parseInt(stored, 10) : 0;
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  } catch {
    return 0;
  }
};

export const readMode = (): GameMode => {
  if (typeof window === 'undefined') {
    return 'classic';
  }
  try {
    return window.localStorage.getItem(MODE_KEY) === 'safe' ? 'safe' : 'classic';
  } catch {
    return 'classic';
  }
};

export const readBestScore = (mode: GameMode) => {
  if (typeof window === 'undefined') {
    return 0;
  }
  try {
    const stored = window.localStorage.getItem(BEST_SCORE_KEYS[mode]);
    if (stored !== null) {
      const parsed = Number.parseInt(stored, 10);
      return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    }
    return mode === 'classic' ? readNumber(BEST_SCORE_KEY) : 0;
  } catch {
    return 0;
  }
};

export const readBoolean = (key: string, fallback: boolean) => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : stored === 'true';
  } catch {
    return fallback;
  }
};

export const writeValue = (key: string, value: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
  }
};
