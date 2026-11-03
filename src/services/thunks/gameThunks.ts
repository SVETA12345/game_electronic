import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import { BEST_SCORE_KEYS, MODE_KEY } from '../../game/constants';
import type { GameMode } from '../../game/types';
import { writeValue } from '../../utils/storage';
import { gameEnded, gameStarted, modeSelected } from '../slices/gameSlice';
import { recordSaved } from '../slices/recordsSlice';
import type { RootState } from '../types';

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, UnknownAction>;

export const startGame =
  (mode: GameMode): AppThunk =>
  (dispatch) => {
    writeValue(MODE_KEY, mode);
    dispatch(gameStarted(mode));
  };

export const selectMode =
  (mode: GameMode): AppThunk =>
  (dispatch) => {
    writeValue(MODE_KEY, mode);
    dispatch(modeSelected(mode));
  };

export const finishGame =
  ({ score, won }: { score: number; won: boolean }): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { mode } = state.game;
    const isRecord = score > state.records.bestScores[mode];

    if (isRecord) {
      dispatch(recordSaved({ mode, score }));
      writeValue(BEST_SCORE_KEYS[mode], String(score));
    }

    dispatch(gameEnded({ score, won, isRecord }));
  };
