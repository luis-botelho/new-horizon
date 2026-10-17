import { describe, expect, it } from 'vitest';
import { elapsedRatio, getDeadline } from './deadline';

const now = new Date('2026-10-17T12:00:00Z');
const inDays = (d: number) => new Date(now.getTime() + d * 86_400_000);

describe('getDeadline', () => {
  it('marca como encerrado quando o prazo passou', () => {
    expect(getDeadline(inDays(-1), now).level).toBe('expired');
  });
  it('usa níveis semânticos por faixa de dias', () => {
    expect(getDeadline(inDays(1), now).level).toBe('critical');
    expect(getDeadline(inDays(5), now).level).toBe('warning');
    expect(getDeadline(inDays(20), now).level).toBe('safe');
  });
  it('escreve o singular corretamente', () => {
    expect(getDeadline(inDays(1), now).label).toBe('Falta 1 dia');
  });
});

describe('elapsedRatio', () => {
  it('fica entre 0 e 1', () => {
    expect(elapsedRatio(inDays(-5), inDays(5), now)).toBeCloseTo(0.5);
    expect(elapsedRatio(inDays(-5), inDays(-1), now)).toBe(1);
  });
});
