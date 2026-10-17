import { elapsedRatio, getDeadline, type DeadlineLevel } from '@/shared/lib/deadline';
import styles from './DeadlineMeter.module.scss';

// Cor nunca é o único indicador: o ícone e o texto repetem a informação.
const ICON: Record<DeadlineLevel, string> = {
  safe: '●',
  warning: '▲',
  critical: '■',
  expired: '✕',
};

interface DeadlineMeterProps {
  publishedAt: Date;
  deadline: Date;
  now: Date;
}

export function DeadlineMeter({ publishedAt, deadline, now }: DeadlineMeterProps) {
  const info = getDeadline(deadline, now);
  const pct = Math.round(elapsedRatio(publishedAt, deadline, now) * 100);

  return (
    <div className={`${styles.root} ${styles[info.level]}`}>
      <span className={styles.label}>
        <span aria-hidden="true">{ICON[info.level]} </span>
        {info.label}
      </span>
      <div className={styles.track} role="img" aria-label={`${pct}% do prazo já passou`}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
