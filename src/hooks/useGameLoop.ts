import { useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { SoundPlayer } from '../game/audio';
import { FIELD_WIDTH, FIELD_HEIGHT } from '../game/constants';
import type { GameMode } from '../game/types';

interface UseGameLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  engineRef: React.MutableRefObject<GameEngine | null>;
  soundRef: React.MutableRefObject<SoundPlayer | null>;
  soundOn: boolean;
  modeRef: React.MutableRefObject<GameMode>;
  callbacks: {
    onScore: (score: number) => void;
    onLives: (lives: number) => void;
    onLevel: (level: number) => void;
    onGameOver: (score: number, won: boolean) => void;
  };
}

export const useGameLoop = ({ canvasRef, engineRef, soundRef, soundOn, modeRef, callbacks }: UseGameLoopProps) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    const sound = new SoundPlayer();
    sound.setEnabled(soundOn);
    soundRef.current = sound;

    const engine = new GameEngine({
      onScore: callbacks.onScore,
      onLives: callbacks.onLives,
      onLevel: callbacks.onLevel,
      onGameOver: (finalScore, won) => {
        callbacks.onGameOver(finalScore, won);
      },
      onSound: (event) => sound.play(event),
    });

    engine.setMode(modeRef.current);
    engineRef.current = engine;

    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const configureCanvas = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(FIELD_WIDTH * pixelRatio);
      canvas.height = Math.round(FIELD_HEIGHT * pixelRatio);
    };

    configureCanvas();
    window.addEventListener('resize', configureCanvas);

    let frame = 0;
    let previousTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - previousTime) / 1000;
      previousTime = now;

      engine.tick(delta);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      engine.render(context);

      frame = window.requestAnimationFrame(loop);
    };

    frame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', configureCanvas);
      sound.stopMusic();
      sound.setEnabled(false);
      soundRef.current = null;
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
