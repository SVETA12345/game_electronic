import styles from './PauseOverlay.module.less';
import breakImage from '../../images/break.gif';
interface Props {
  modeLabel: string;
  togglePause: () => void;
  backToMenu: () => void;
}
export const PauseOverlay = ({ modeLabel, togglePause, backToMenu }: Props) => {
  return (
    <div className={`${styles.overlay} ${styles.overlayPause}`}>
      <div className={styles.pauseCard}>
        <img className={styles.resultImage} src={breakImage} alt="Гиф" draggable={false} />
        <span className={styles.kicker}>ПЕРЕРЫВ · {modeLabel}</span>
        <h2 className={styles.resultTitle}>ПАУЗА</h2>
        <p className={styles.pauseText}>Волк ждёт. Яйца не падают.</p>
        <div className={styles.actions}>
          <button className={styles.primaryButton} type="button" onClick={togglePause}>
            ПРОДОЛЖИТЬ
          </button>
          <button className={styles.secondaryButton} type="button" onClick={backToMenu}>
            В МЕНЮ
          </button>
        </div>
        <span className={styles.keys}>ПРОБЕЛ — продолжить</span>
      </div>
    </div>
  );
};
