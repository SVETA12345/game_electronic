import styles from './StartOverlay.module.less';
interface Props {
  mode: 'classic' | 'safe';
  setMode: (mode: 'classic' | 'safe') => void;
  best: number;
  modeSubtitle: string;
  modeLabel: string;
  padScore: (value: number) => string;
  startGame: () => void;
}
export const StartOverlay = ({ mode, setMode, best, modeSubtitle, modeLabel, padScore, startGame }: Props) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.startCard}>
        <span className={styles.kicker}>ЭЛЕКТРОНИКА · ИГРА</span>
        <h1 className={styles.title}>НУ, ПОГОДИ!</h1>
        <p className={styles.subtitle}>{modeSubtitle}</p>
        <div className={styles.modePicker} role="group" aria-label="Режим игры">
          <span className={styles.modePickerLabel}>РЕЖИМ</span>
          <div className={styles.modeOptions}>
            <button
              className={`${styles.modeOption} ${mode === 'classic' ? styles.modeOptionActive : ''}`}
              type="button"
              onClick={() => setMode('classic')}
              aria-pressed={mode === 'classic'}
            >
              <span className={`${styles.modeMark} ${styles.modeMarkBomb}`} />С БОМБАМИ
            </button>
            <button
              className={`${styles.modeOption} ${mode === 'safe' ? styles.modeOptionActive : ''}`}
              type="button"
              onClick={() => setMode('safe')}
              aria-pressed={mode === 'safe'}
            >
              <span className={`${styles.modeMark} ${styles.modeMarkSafe}`} />
              БЕЗ БОМБ
            </button>
          </div>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendEgg} />
            +10
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendEgg} ${styles.legendGold}`} />
            +25
          </span>
          {mode === 'classic' ? (
            <span className={styles.legendItem}>
              <span className={styles.legendBomb} />
              −1
            </span>
          ) : (
            <span className={`${styles.legendItem} ${styles.legendNote}`}>БЕЗ БОМБ</span>
          )}
        </div>
        <button className={styles.primaryButton} type="button" onClick={startGame}>
          ИГРАТЬ
        </button>
        <span className={styles.best}>
          РЕКОРД · {modeLabel}: {padScore(best)}
        </span>
        <span className={styles.keys}>← → / A D — движение · ПРОБЕЛ — пауза</span>
      </div>
    </div>
  );
};
