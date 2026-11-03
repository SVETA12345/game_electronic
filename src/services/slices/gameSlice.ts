import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { START_LIVES } from '../../game/constants';
import type { GameMode } from '../../game/types';

export type UiPhase = 'start' | 'playing' | 'paused' | 'gameover';

export interface GameState {
  phase: UiPhase;
  score: number;
  lives: number;
  level: number;
  mode: GameMode;
  won: boolean;
  isRecord: boolean;
}

export const initialGameState: GameState = {
  phase: 'start',
  score: 0,
  lives: START_LIVES,
  level: 1,
  mode: 'classic',
  won: false,
  isRecord: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState: initialGameState,
  reducers: {
    gameStarted(state, action: PayloadAction<GameMode>) {
      state.phase = 'playing';
      state.score = 0;
      state.lives = START_LIVES;
      state.level = 1;
      state.mode = action.payload;
      state.won = false;
      state.isRecord = false;
    },
    modeSelected(state, action: PayloadAction<GameMode>) {
      state.mode = action.payload;
    },
    gamePaused(state) {
      if (state.phase === 'playing') {
        state.phase = 'paused';
      }
    },
    gameResumed(state) {
      if (state.phase === 'paused') {
        state.phase = 'playing';
      }
    },
    gameLeft(state) {
      state.phase = 'start';
      state.score = 0;
      state.lives = START_LIVES;
      state.level = 1;
      state.won = false;
      state.isRecord = false;
    },
    scoreChanged(state, action: PayloadAction<number>) {
      state.score = action.payload;
    },
    livesChanged(state, action: PayloadAction<number>) {
      state.lives = action.payload;
    },
    levelChanged(state, action: PayloadAction<number>) {
      state.level = action.payload;
    },
    gameEnded(state, action: PayloadAction<{ score: number; won: boolean; isRecord: boolean }>) {
      state.phase = 'gameover';
      state.score = action.payload.score;
      state.won = action.payload.won;
      state.isRecord = action.payload.isRecord;
    },
  },
});

export const {
  gameStarted,
  modeSelected,
  gamePaused,
  gameResumed,
  gameLeft,
  scoreChanged,
  livesChanged,
  levelChanged,
  gameEnded,
} = gameSlice.actions;

export default gameSlice.reducer;
