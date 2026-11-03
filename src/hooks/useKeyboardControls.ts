import { useEffect } from 'react';

export const useKeyboardControls = ({
  onPrimary,
  onMoveLeft,
  onMoveRight,
  onTogglePause,
}: {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onTogglePause: () => void;
  onPrimary: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const code = event.code;
      const key = event.key.toLowerCase();
      const target = event.target;
      const isControl =
        target instanceof HTMLElement && Boolean(target.closest('button, a, input, select, textarea, [role="button"]'));
      if (code === 'ArrowLeft' || code === 'KeyA' || key === 'ф') {
        event.preventDefault();
        onMoveLeft();
        return;
      }

      if (code === 'ArrowRight' || code === 'KeyD' || key === 'в') {
        event.preventDefault();
        onMoveRight();
        return;
      }
      if ((code === 'Space' || code === 'Enter' || key === ' ') && !isControl) {
        event.preventDefault();
        if (!event.repeat) {
          onPrimary();
        }
        return;
      }

      if (code === 'KeyP' || key === 'з' || key === 'p') {
        event.preventDefault();
        if (!event.repeat) {
          onTogglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrimary, onMoveLeft, onMoveRight, onTogglePause]);
};
