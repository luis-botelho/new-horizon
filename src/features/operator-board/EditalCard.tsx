'use client';

import { useState } from 'react';
import { TranslatedText } from '@/shared/ui/TranslatedText';
import { formatBRL } from '@/shared/lib/format';
import { KANBAN_STAGES, type KanbanStage } from '@/shared/types/domain';
import { DeadlineMeter } from './DeadlineMeter';
import { useMoveEdital } from './queries';
import type { Edital } from './schemas';
import { STAGE_META, canMove } from './stages';
import styles from './EditalCard.module.scss';

interface EditalCardProps {
  edital: Edital;
  now: Date;
}

export function EditalCard({ edital, now }: EditalCardProps) {
  const move = useMoveEdital();
  const [blocked, setBlocked] = useState<string | null>(null);

  function handleMove(to: KanbanStage) {
    const check = canMove(edital, to);
    if (!check.ok) {
      setBlocked(check.reason);
      return;
    }
    setBlocked(null);
    move.mutate({ id: edital.id, to }, { onError: (e) => setBlocked(e.message) });
  }

  return (
    <article className={styles.card}>
      <p className={styles.where}>
        {edital.orgao} · {edital.municipio}/{edital.uf}
      </p>
      <TranslatedText simple={edital.objetoSimples} official={edital.objetoOficial} />
      <div className={styles.meta}>
        <strong>{formatBRL(edital.valorEstimadoCentavos)}</strong>
        <span className={styles.docs}>
          {edital.documentos.prontos}/{edital.documentos.total} documentos
        </span>
      </div>
      <DeadlineMeter publishedAt={edital.publicadoEm} deadline={edital.dataLimite} now={now} />

      <label className={styles.move}>
        Mover para
        <select value={edital.stage} onChange={(e) => handleMove(e.target.value as KanbanStage)}>
          {KANBAN_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_META[stage].label}
            </option>
          ))}
        </select>
      </label>
      {blocked && (
        <p role="alert" className={styles.blocked}>
          {blocked}
        </p>
      )}
    </article>
  );
}
