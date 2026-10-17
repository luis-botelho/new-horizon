'use client';

import { useMemo } from 'react';
import { Button } from '@/shared/ui/Button';
import { KANBAN_STAGES } from '@/shared/types/domain';
import { BoardColumn } from './BoardColumn';
import { useEditais } from './queries';
import { useBoardFilters } from './store';
import styles from './OperatorBoard.module.scss';

export function OperatorBoard() {
  const { data, isPending, isError, refetch } = useEditais();
  // Selectors: o componente só re-renderiza quando o valor selecionado muda.
  const uf = useBoardFilters((s) => s.uf);
  const setUf = useBoardFilters((s) => s.setUf);

  const now = useMemo(() => new Date(), [data]);
  const visible = useMemo(() => (data ?? []).filter((e) => uf === null || e.uf === uf), [data, uf]);
  const ufs = useMemo(() => [...new Set((data ?? []).map((e) => e.uf))].sort(), [data]);

  if (isPending) return <p className={styles.status}>Buscando seus editais…</p>;

  if (isError) {
    return (
      <div role="alert">
        <p>Não conseguimos buscar os editais.</p>
        <Button variant="ghost" onClick={() => refetch()}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.toolbar}>
        <label>
          Estado{' '}
          <select value={uf ?? ''} onChange={(e) => setUf(e.target.value || null)}>
            <option value="">Todos</option>
            {ufs.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.columns}>
        {KANBAN_STAGES.map((stage) => (
          <BoardColumn
            key={stage}
            stage={stage}
            editais={visible.filter((e) => e.stage === stage)}
            now={now}
          />
        ))}
      </div>
    </>
  );
}
