import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { SoundPlayer } from '../../game/audio';
import { FIELD_WIDTH, MAX_LEVEL, SOUND_KEY, START_LIVES } from '../../game/constants';
import { GameEngine } from '../../game/engine';
import type { GameMode } from '../../game/types';
import consoleImage from '../../images/screen_main.png';
import styles from './Game.module.less';
import { readBoolean, writeValue } from '../../utils/storage';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useAppDispatch, useAppSelector } from '../../services/hooks';
import {
  gameLeft,
  gamePaused,
  gameResumed,
  levelChanged,
  livesChanged,
  scoreChanged,
} from '../../services/slices/gameSlice';
import { finishGame, selectMode, startGame as startGameSession } from '../../services/thunks/gameThunks';
import { StartOverlay } from '../StartOverlay/StartOverlay';
import { PauseOverlay } from '../PauseOverlay/PauseOverlay';
import { GameOverOverlay } from '../GameOverOverlay/GameOverOverlay';
import { GameControls } from '../GameControls/GameControls';
import { Hud } from '../Hud/Hud';

const padScore = (value: number) => {
  const text = String(Math.max(0, Math.floor(value)));
  return text.length >= 4 ? text : '0'.repeat(4 - text.length) + text;
};

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const soundRef = useRef<SoundPlayer | null>(null);
  const dispatch = useAppDispatch();

  const phase = useAppSelector((state) => state.game.phase);
  const score = useAppSelector((state) => state.game.score);
  const lives = useAppSelector((state) => state.game.lives);
  const level = useAppSelector((state) => state.game.level);
  const mode = useAppSelector((state) => state.game.mode);
  const isRecord = useAppSelector((state) => state.game.isRecord);
  const won = useAppSelector((state) => state.game.won);
  const best = useAppSelector((state) => state.records.bestScores[state.game.mode]);
  const [soundOn, setSoundOn] = useState(() => readBoolean(SOUND_KEY, true));

  const phaseRef = useRef(phase);
  const modeRef = useRef(mode);

  const livesLeft = Array.from({ length: START_LIVES }, (_, index) => index < lives);
  const modeLabel = mode === 'classic' ? 'С БОМБАМИ' : 'БЕЗ БОМБ';
  const modeSubtitle =
    mode === 'classic'
      ? `Лови яйца, уворачивайся от бомб и дойди до ${MAX_LEVEL} уровня.`
      : `Тренировочный режим: только яйца, без бомб. Дойди до ${MAX_LEVEL} уровня.`;
  const pointerLabel =
    phase === 'playing' ? 'Пауза' : phase === 'paused' ? 'Продолжить' : phase === 'start' ? 'Играть' : 'Ещё раз';
  const deckLabel =
    phase === 'playing' ? 'ПАУЗА' : phase === 'paused' ? 'ДАЛЬШЕ' : phase === 'start' ? 'СТАРТ' : 'ЗАНОВО';
  const startGame = useCallback(
    (nextMode?: GameMode) => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }

      const selectedMode: GameMode = nextMode === 'safe' || nextMode === 'classic' ? nextMode : modeRef.current;
      modeRef.current = selectedMode;
      dispatch(startGameSession(selectedMode));

      soundRef.current?.unlock();
      engine.setMode(selectedMode);
      engine.start();
      soundRef.current?.startMusic();
    },
    [dispatch],
  );

  const togglePause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    if (phaseRef.current === 'playing') {
      engine.pause();
      soundRef.current?.pauseMusic();
      dispatch(gamePaused());
    } else if (phaseRef.current === 'paused') {
      engine.resume();
      soundRef.current?.resumeMusic();
      dispatch(gameResumed());
    }
  }, [dispatch]);

  const backToMenu = useCallback(() => {
    engineRef.current?.toMenu();
    soundRef.current?.stopMusic();
    dispatch(gameLeft());
  }, [dispatch]);

  const changeMode = useCallback(
    (nextMode: GameMode) => {
      modeRef.current = nextMode;
      dispatch(selectMode(nextMode));
    },
    [dispatch],
  );

  const handlePrimary = useCallback(() => {
    if (phaseRef.current === 'playing' || phaseRef.current === 'paused') {
      togglePause();
    } else {
      startGame();
    }
  }, [startGame, togglePause]);

  const moveLeft = useCallback(() => {
    soundRef.current?.unlock();
    engineRef.current?.moveLeft();
  }, []);

  const moveRight = useCallback(() => {
    soundRef.current?.unlock();
    engineRef.current?.moveRight();
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    soundRef.current?.setEnabled(next);
    if (next) {
      soundRef.current?.unlock();
    }
    setSoundOn(next);
  }, [soundOn]);

  const handleCanvasPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (phaseRef.current !== 'playing') {
      return;
    }

    soundRef.current?.unlock();
    const bounds = event.currentTarget.getBoundingClientRect();

    const relativeX = (event.clientX - bounds.left) / Math.max(1, bounds.width);
    const clickGameX = relativeX * FIELD_WIDTH;
    const wolfX = engineRef.current?.getPlayerX() ?? 0;

    if (clickGameX < wolfX) {
      engineRef.current?.moveLeft();
    } else {
      engineRef.current?.moveRight();
    }
  };

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    modeRef.current = mode;
    engineRef.current?.setMode(mode);
  }, [mode]);

  useEffect(() => {
    soundRef.current?.setEnabled(soundOn);
    writeValue(SOUND_KEY, String(soundOn));
  }, [soundOn]);

  useGameLoop({
    canvasRef,
    engineRef,
    soundRef,
    soundOn,
    modeRef,
    callbacks: {
      onScore: (nextScore) => dispatch(scoreChanged(nextScore)),
      onLives: (nextLives) => dispatch(livesChanged(nextLives)),
      onLevel: (nextLevel) => dispatch(levelChanged(nextLevel)),
      onGameOver: (finalScore, didWin) => {
        soundRef.current?.stopMusic();
        dispatch(finishGame({ score: finalScore, won: didWin }));
      },
    },
  });
  useKeyboardControls({
    onPrimary: handlePrimary,
    onMoveLeft: moveLeft,
    onMoveRight: moveRight,
    onTogglePause: togglePause,
  });
  return (
    <section className={styles.game}>
      <div className={styles.consoleWrapper}>
        <div className={styles.brandPlate} aria-hidden="true">
          ЭЛЕКТРОНИКА
        </div>
        <img src={consoleImage} alt="" className={styles.consoleBody} draggable={false} />
        <button
          type="button"
          className={`${styles.hardwareButton} ${styles.buttonGameA}`}
          onClick={(event) => {
            event.currentTarget.blur();
            startGame('safe');
          }}
          aria-label="Игра А"
          title="Игра без бомб"
        />
        <button
          type="button"
          className={`${styles.hardwareButton} ${styles.buttonGameB}`}
          onClick={(event) => {
            event.currentTarget.blur();
            startGame('classic');
          }}
          aria-label="Игра Б"
          title="Игра с бомбами"
        />
        <button
          className={`${styles.hardwareButton} ${styles.buttonGameRight}`}
          onClick={() => {
            moveRight();
          }}
          aria-label="Вправо"
          title="Вправо"
        />
        <button
          className={`${styles.hardwareButton} ${styles.buttonGameLeft}`}
          onClick={() => {
            moveLeft();
          }}
          aria-label="Влево"
          title="Влево"
        />

        <div className={styles.screen}>
          <div className={styles.surface}>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              onPointerDown={handleCanvasPointerDown}
              aria-label={
                mode === 'classic'
                  ? 'Игровое поле: волк ловит яйца, избегайте бомб'
                  : 'Игровое поле: волк ловит яйца, бомб нет'
              }
            />
            <Hud
              score={score}
              level={level}
              maxLevel={MAX_LEVEL}
              lives={lives}
              livesLeft={livesLeft}
              phase={phase}
              soundOn={soundOn}
              onTogglePause={togglePause}
              onToggleSound={toggleSound}
              pointerLabel={pointerLabel}
              padScore={padScore}
            />
            {phase === 'start' && (
              <StartOverlay
                mode={mode}
                setMode={changeMode}
                best={best}
                modeSubtitle={modeSubtitle}
                modeLabel={modeLabel}
                padScore={padScore}
                startGame={() => startGame()}
              />
            )}

            {phase === 'paused' && (
              <PauseOverlay modeLabel={modeLabel} togglePause={togglePause} backToMenu={backToMenu} />
            )}

            {phase === 'gameover' && (
              <GameOverOverlay
                score={score}
                best={best}
                isRecord={isRecord}
                modeLabel={modeLabel}
                won={won}
                padScore={padScore}
                startGame={() => startGame()}
                backToMenu={backToMenu}
              />
            )}
          </div>
        </div>
      </div>

      <GameControls
        onMoveLeft={moveLeft}
        onMoveRight={moveRight}
        onPrimary={handlePrimary}
        primaryLabel={deckLabel}
        pointerLabel={pointerLabel}
      />

      <p className={styles.hint}>
        <span>{modeLabel}</span> · <span>← → / A D</span> — движение · <span>ПРОБЕЛ</span> — пауза · нажмите на
        полэкрана, чтобы шагнуть
      </p>
    </section>
  );
};
