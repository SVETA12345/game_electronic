import { MAX_LEVEL } from '../../game/constants';
import lossImage from '../../images/loss.gif';
import victoryImage from '../../images/victory.gif';
import styles from './GameOverOverlay.module.less';

interface Props {
  score: number;
  best: number;
  isRecord: boolean;
  modeLabel: string;
  won: boolean;
  padScore: (value: number) => string;
  startGame: () => void;
  backToMenu: () => void;
}

export const GameOverOverlay = ({ score, best, isRecord, modeLabel, won, padScore, startGame, backToMenu }: Props) => (
  <div className={`${styles.overlay} ${won ? styles.overlayWin : styles.overlayDark}`}>
    <div className={styles.resultCard}>
      {isRecord && <span className={styles.recordBadge}>НОВЫЙ РЕКОРД!</span>}
      <img className={styles.resultImage} src={won ? victoryImage : lossImage} alt="Гиф" draggable={false} />
      <span className={styles.kicker}>
        {won ? 'ПОБЕДА' : 'УРОЖАЙ НЕ СОБРАН'} · {modeLabel}
      </span>
      <h2 className={`${styles.resultTitle} ${won ? styles.resultTitleWin : ''}`}>
        {won ? 'ВЫ ВЫИГРАЛИ!' : 'ИГРА ОКОНЧЕНА'}
      </h2>
      <div className={styles.finalScore}>
        <span className={styles.finalScoreLabel}>ФИНАЛЬНЫЙ СЧЁТ</span>
        <strong className={styles.finalScoreValue}>{padScore(score)}</strong>
      </div>
      <span className={styles.best}>
        РЕКОРД · {modeLabel}: {padScore(best)}
      </span>
      <div className={styles.actions}>
        <button className={styles.primaryButton} type="button" onClick={startGame}>
          ЕЩЁ РАЗ
        </button>
        <button className={styles.secondaryButton} type="button" onClick={backToMenu}>
          В МЕНЮ
        </button>
      </div>
      <span className={styles.keys}>{won ? `УРОВЕНЬ ${MAX_LEVEL} ДОСТИГНУТ · ИГРА ЗАВЕРШЕНА` : 'СПАСИБО ЗА ИГРУ'}</span>
    </div>
  </div>
);
