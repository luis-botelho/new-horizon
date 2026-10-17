export type DeadlineLevel = 'safe' | 'warning' | 'critical' | 'expired';

export interface DeadlineInfo {
  level: DeadlineLevel;
  days: number;
  label: string;
}

const DAY_MS = 86_400_000;

export function getDeadline(deadline: Date, now: Date): DeadlineInfo {
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return { level: 'expired', days: 0, label: 'Prazo encerrado' };

  const days = Math.ceil(diff / DAY_MS);
  const label = days === 1 ? 'Falta 1 dia' : `Faltam ${days} dias`;
  const level: DeadlineLevel = days <= 2 ? 'critical' : days <= 7 ? 'warning' : 'safe';
  return { level, days, label };
}

/** Fração (0..1) do tempo já consumido entre a publicação e o prazo. */
export function elapsedRatio(publishedAt: Date, deadline: Date, now: Date): number {
  const total = deadline.getTime() - publishedAt.getTime();
  if (total <= 0) return 1;
  const ratio = (now.getTime() - publishedAt.getTime()) / total;
  return Math.min(1, Math.max(0, ratio));
}
