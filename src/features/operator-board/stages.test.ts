import { describe, expect, it } from 'vitest';
import { canMove } from './stages';

describe('canMove', () => {
  const base = { stage: 'documents' as const, documentos: { total: 7, prontos: 4 } };

  it('bloqueia proposta com papelada incompleta e explica o motivo', () => {
    const check = canMove(base, 'proposal');
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.reason).toContain('3 documentos');
  });

  it('libera com papelada completa', () => {
    expect(canMove({ ...base, documentos: { total: 7, prontos: 7 } }, 'proposal').ok).toBe(true);
  });
});
