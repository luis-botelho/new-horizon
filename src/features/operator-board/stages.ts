import type { Edital } from './schemas';
import type { KanbanStage } from '@/shared/types/domain';

export const STAGE_META: Record<KanbanStage, { label: string; hint: string }> = {
  radar: { label: 'Radar', hint: 'Editais que combinam com seu perfil' },
  analysis: { label: 'Vale a pena?', hint: 'Em análise de viabilidade' },
  documents: { label: 'Papelada', hint: 'Reunindo documentos de habilitação' },
  proposal: { label: 'Proposta', hint: 'Montando e enviando a proposta' },
  live: { label: 'Pregão ao vivo', hint: 'Sessão pública em andamento' },
  result: { label: 'Resultado', hint: 'Ganhou, perdeu ou em recurso' },
};

export type MoveCheck = { ok: true } | { ok: false; reason: string };

/**
 * Regra de negócio pura (sem React), usada no cliente e no servidor.
 * Pré-condições explicam o que falta em vez de só bloquear.
 */
export function canMove(
  edital: Pick<Edital, 'stage' | 'documentos'>,
  to: KanbanStage,
): MoveCheck {
  if (edital.stage === to) return { ok: true };

  const missing = edital.documentos.total - edital.documentos.prontos;
  if ((to === 'proposal' || to === 'live') && missing > 0) {
    const noun = missing === 1 ? 'documento' : 'documentos';
    return { ok: false, reason: `Ainda ${missing === 1 ? 'falta' : 'faltam'} ${missing} ${noun} da papelada.` };
  }
  return { ok: true };
}
