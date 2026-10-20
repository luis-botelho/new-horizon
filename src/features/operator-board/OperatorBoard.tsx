'use client';

import { useMemo, useState, type DragEvent } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from '@/shared/ui/Button';
import { KANBAN_STAGES, type KanbanStage } from '@/shared/types/domain';
import { BoardColumn } from './BoardColumn';
import { EditalCard } from './EditalCard';
import { useEditais, useMoveEdital } from './queries';
import { useBoardFilters } from './store';
import { canMove } from './stages';
import type { Edital } from './schemas';
import styles from './OperatorBoard.module.scss';

export function OperatorBoard() {
  const { data, isPending, isError, refetch } = useEditais();
  const move = useMoveEdital();
  // Selectors: o componente só re-renderiza quando o valor selecionado muda.
  const uf = useBoardFilters((s) => s.uf);
  const setUf = useBoardFilters((s) => s.setUf);

  const now = useMemo(() => new Date(), [data]);
  const visible = useMemo(() => (data ?? []).filter((e) => uf === null || e.uf === uf), [data, uf]);
  const ufs = useMemo(() => [...new Set((data ?? []).map((e) => e.uf))].sort(), [data]);

  const [activeEdital, setActiveEdital] = useState<Edital | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 6 },
    }),
  );

  const byStage = useMemo(
    () => Object.fromEntries(KANBAN_STAGES.map((stage) => [stage, visible.filter((e) => e.stage === stage)])) as Record<
      KanbanStage,
      Edital[]
    >,
    [visible],
  );

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setBlocked(null);
    const found = (data ?? []).find((e) => e.id === id) ?? null;
    setActiveEdital(found);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEdital(null);
    const { active, over } = event;
    if (!over) return;
    const id = String(active.id);
    const to = String(over.id) as KanbanStage;
    if (!KANBAN_STAGES.includes(to)) return;
    const edital = (data ?? []).find((e) => e.id === id);
    if (!edital || edital.stage === to) return;

    const check = canMove(edital, to);
    if (!check.ok) {
      setBlocked(check.reason);
      return;
    }
    setBlocked(null);
    move.mutate(
      { id: edital.id, to },
      { onError: (e) => setBlocked((e as Error).message) },
    );
  }

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
      {blocked && (
        <p role="alert" className={styles.blocked}>
          {blocked}
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.columns}>
          {KANBAN_STAGES.map((stage) => (
            <BoardColumn
              key={stage}
              stage={stage}
              editais={byStage[stage]}
              now={now}
            />
          ))}
        </div>
        <DragOverlay>
          {activeEdital ? <EditalCard edital={activeEdital} now={now} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
