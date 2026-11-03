import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { GameState } from './slices/gameSlice';
import type { RecordsState } from './slices/recordsSlice';

export interface RootState {
  game: GameState;
  records: RecordsState;
}

export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;
