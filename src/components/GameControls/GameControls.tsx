import styles from './GameControls.module.less';

interface Props {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  pointerLabel: string;
}

export const GameControls = ({ onMoveLeft, onMoveRight, onPrimary, primaryLabel, pointerLabel }: Props) => {
  return (
    <div className={styles.controls} aria-label="Экранные кнопки управления">
      <button className={styles.controlButton} type="button" onClick={onMoveLeft} aria-label="Шаг влево">
        ◀
      </button>
      <button
        className={`${styles.controlButton} ${styles.controlButtonWide}`}
        type="button"
        onClick={onPrimary}
        aria-label={pointerLabel}
      >
        {primaryLabel}
      </button>
      <button className={styles.controlButton} type="button" onClick={onMoveRight} aria-label="Шаг вправо">
        ▶
      </button>
    </div>
  );
};
