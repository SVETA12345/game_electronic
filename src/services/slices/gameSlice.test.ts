import gameReducer, { gameStarted, scoreChanged, livesChanged, levelChanged } from './gameSlice';

describe('gameSlice', () => {
  it('сбрасывает состояние при старте игры', () => {
    const state = gameReducer(
      {
        phase: 'gameover',
        score: 100,
        lives: 0,
        level: 5,
        mode: 'classic',
        won: true,
        isRecord: true,
      },
      gameStarted('safe'),
    );

    expect(state.phase).toBe('playing');
    expect(state.mode).toBe('safe');
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.level).toBe(1);
    expect(state.won).toBe(false);
    expect(state.isRecord).toBe(false);
  });

  it('обновляет счёт, жизни и уровень', () => {
    let state = gameReducer(undefined, scoreChanged(40));
    state = gameReducer(state, livesChanged(2));
    state = gameReducer(state, levelChanged(3));

    expect(state.score).toBe(40);
    expect(state.lives).toBe(2);
    expect(state.level).toBe(3);
  });
});
