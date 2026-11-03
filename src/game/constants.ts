export const FIELD_WIDTH = 600;
export const FIELD_HEIGHT = 384;

export const LANE_COUNT = 4;
export const LANE_WIDTH = FIELD_WIDTH / LANE_COUNT;
export const LANE_CENTERS = Array.from({ length: LANE_COUNT }, (_, index) => LANE_WIDTH * (index + 0.5));

export const HEN_Y = 86;
export const SPAWN_Y = 112;
export const PLAYER_Y = 294;
export const CATCH_Y = 308;
export const GROUND_Y = 338;

export const START_LIVES = 3;
export const SCORE_PER_EGG = 10;
export const SCORE_PER_GOLD = 25;
export const LEVEL_STEP = 120;
export const MAX_LEVEL = 5;

export const BEST_SCORE_KEY = 'nu-pogodi-best-score';
export const BEST_SCORE_KEYS = {
  classic: 'nu-pogodi-best-score-classic',
  safe: 'nu-pogodi-best-score-safe',
} as const;
export const MODE_KEY = 'nu-pogodi-mode';
export const SOUND_KEY = 'nu-pogodi-sound';

export const PALETTE = {
  screen: '#a9c38c',
  screenLight: '#b9d09d',
  screenDeep: '#8fac72',
  ink: '#26331f',
  inkSoft: '#4a5b3e',
  cream: '#f4efd8',
  creamDark: '#d9d2b4',
  gray: '#7d8b70',
  grayDark: '#59674f',
  straw: '#c7b071',
  red: '#bf5436',
  redDark: '#8f3827',
  gold: '#d9a93c',
  goldLight: '#f0cf74',
  white: '#fbf8e9',
} as const;

export type PaletteColor = (typeof PALETTE)[keyof typeof PALETTE];
