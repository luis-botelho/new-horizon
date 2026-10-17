import { editaisSchema, type Edital } from './schemas';
import type { EditalId, KanbanStage } from '@/shared/types/domain';
import { env } from '@/shared/lib/env';

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

const base = `${env.apiUrl}/api/editais`;

export async function fetchEditais(): Promise<Edital[]> {
  const res = await fetch(base);
  if (!res.ok) throw new HttpError(res.status, 'Falha ao buscar editais');
  return editaisSchema.parse(await res.json());
}

export async function moveEdital(id: EditalId, stage: KanbanStage): Promise<void> {
  const res = await fetch(`${base}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const reason =
      typeof body === 'object' && body !== null && 'reason' in body && typeof body.reason === 'string'
        ? body.reason
        : 'Não conseguimos mover este edital.';
    throw new HttpError(res.status, reason);
  }
}
