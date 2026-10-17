import type { KanbanStage } from '@/shared/types/domain';
import { EditalCard } from './EditalCard';
import type { Edital } from './schemas';
import { STAGE_META } from './stages';
import styles from './BoardColumn.module.scss';

interface BoardColumnProps {
  stage: KanbanStage;
  editais: Edital[];
  now: Date;
}

export function BoardColumn({ stage, editais, now }: BoardColumnProps) {
  const meta = STAGE_META[stage];
  return (
    <section className={styles.column} aria-labelledby={`col-${stage}`}>
      <div className={styles.header}>
        <h2 id={`col-${stage}`}>{meta.label}</h2>
        <span className={styles.count}>{editais.length}</span>
      </div>
      <p className={styles.hint}>{meta.hint}</p>
      {editais.length === 0 ? (
        <p className={styles.empty}>Nenhum edital aqui ainda. Use “Mover para” em outro card.</p>
      ) : (
        editais.map((e) => <EditalCard key={e.id} edital={e} now={now} />)
      )}
    </section>
  );
}
