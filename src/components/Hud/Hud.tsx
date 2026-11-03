import styles from './Hud.module.less';

interface Props {
  score: number;
  level: number;
  maxLevel: number;
  lives: number;
  livesLeft: boolean[];
  phase: 'start' | 'playing' | 'paused' | 'gameover';
  soundOn: boolean;
  pointerLabel: string;
  padScore: (value: number) => string;
  onTogglePause: () => void;
  onToggleSound: () => void;
}

export const Hud = ({
  score,
  level,
  maxLevel,
  lives,
  livesLeft,
  phase,
  soundOn,
  pointerLabel,
  padScore,
  onTogglePause,
  onToggleSound,
}: Props) => {
  return (
    <div className={styles.hud}>
      <div className={styles.stat}>
        <span className={styles.statLabel}>СЧЁТ</span>
        <strong className={styles.statValue}>{padScore(score)}</strong>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>УРОВЕНЬ / {maxLevel}</span>
        <strong className={styles.statValue}>{String(level).padStart(2, '0')}</strong>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>ЖИЗНИ</span>
        <div className={styles.lives} aria-label={`Осталось жизней: ${lives}`}>
          {livesLeft.map((isAlive, index) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={`${styles.lifeEgg} ${isAlive ? styles.lifeEggAlive : styles.lifeEggLost}`}
            />
          ))}
        </div>
      </div>
      <div className={styles.hudActions}>
        <button
          className={styles.iconButton}
          type="button"
          onClick={onTogglePause}
          disabled={phase !== 'playing' && phase !== 'paused'}
          aria-label={pointerLabel}
          title={pointerLabel}
        >
          {phase === 'paused' ? '▶' : 'II'}
        </button>
        <button
          className={styles.iconButton}
          type="button"
          onClick={onToggleSound}
          aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}
          title={soundOn ? 'Выключить звук' : 'Включить звук'}
        >
          {soundOn ? '♪' : '×'}
        </button>
      </div>
    </div>
  );
};
