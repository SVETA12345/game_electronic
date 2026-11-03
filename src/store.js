import { configureStore } from '@reduxjs/toolkit';
import gameReducer, { initialGameState } from './services/slices/gameSlice';
import recordsReducer, { initialRecordsState } from './services/slices/recordsSlice';
import { readBestScore, readMode } from './utils/storage';

const store = configureStore({
  reducer: {
    game: gameReducer,
    records: recordsReducer,
  },
  preloadedState: {
    game: {
      ...initialGameState,
      mode: readMode(),
    },
    records: {
      ...initialRecordsState,
      bestScores: {
        classic: readBestScore('classic'),
        safe: readBestScore('safe'),
      },
    },
  },
});

export default store;
