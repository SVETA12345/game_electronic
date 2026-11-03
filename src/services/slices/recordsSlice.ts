import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GameMode } from '../../game/types';

export interface RecordsState {
  bestScores: Record<GameMode, number>;
}

export const initialRecordsState: RecordsState = {
  bestScores: {
    classic: 0,
    safe: 0,
  },
};

const recordsSlice = createSlice({
  name: 'records',
  initialState: initialRecordsState,
  reducers: {
    recordSaved(state, action: PayloadAction<{ mode: GameMode; score: number }>) {
      const { mode, score } = action.payload;
      if (score > state.bestScores[mode]) {
        state.bestScores[mode] = score;
      }
    },
  },
});

export const { recordSaved } = recordsSlice.actions;

export default recordsSlice.reducer;
