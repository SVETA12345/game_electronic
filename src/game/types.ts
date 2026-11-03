export type GamePhase = 'idle' | 'running' | 'paused' | 'over';

export type GameMode = 'classic' | 'safe';

export type EggKind = 'egg' | 'gold' | 'bomb';

export type SoundEvent = 'catch' | 'gold' | 'miss' | 'goldmiss' | 'bomb' | 'level' | 'start' | 'win' | 'gameover';

export interface EngineCallbacks {
  onScore: (score: number) => void;
  onLives: (lives: number) => void;
  onLevel: (level: number) => void;
  onGameOver: (score: number, won: boolean) => void;
  onSound: (event: SoundEvent) => void;
}

export interface Egg {
  id: number;
  lane: number;
  y: number;
  speed: number;
  kind: EggKind;
  wobble: number;
  phase: number;
  checked: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  gravity: number;
}

export interface FloatingLabel {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}
