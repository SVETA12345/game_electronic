import recordsReducer, { recordSaved } from './recordsSlice';

describe('recordsSlice', () => {
  it('сохраняет новый рекорд, если он выше текущего', () => {
    const state = recordsReducer(
      { bestScores: { classic: 100, safe: 50 } },
      recordSaved({ mode: 'classic', score: 150 }),
    );

    expect(state.bestScores.classic).toBe(150);
    expect(state.bestScores.safe).toBe(50);
  });

  it('не перезаписывает рекорд меньшим счётом', () => {
    const state = recordsReducer(
      { bestScores: { classic: 100, safe: 50 } },
      recordSaved({ mode: 'classic', score: 80 }),
    );

    expect(state.bestScores.classic).toBe(100);
  });
});
