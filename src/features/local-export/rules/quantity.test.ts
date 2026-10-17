import { describe, expect, it } from 'vitest';

import { SAMPLE_EDITAL } from '@/shared/types/__fixtures__/editalSample';

import { resolveItemQuantity } from './quantity';

function itemByNumber(itemNumber: number) {
  const found = SAMPLE_EDITAL.itens.find((item) => item.item === itemNumber);
  if (!found) throw new Error(`fixture sem o item ${itemNumber}`);
  return found;
}

describe('resolveItemQuantity', () => {
  it('usa a soma do rateio quando só SDSP tem quantidade', () => {
    const result = resolveItemQuantity(itemByNumber(1));
    expect(result).toEqual({
      quantity: 100,
      source: 'rateio',
      divergence: false,
      rateioSum: 100,
    });
  });

  it('soma SDSP + SPDC', () => {
    const result = resolveItemQuantity(itemByNumber(2));
    expect(result.quantity).toBe(30);
    expect(result.source).toBe('rateio');
    expect(result.divergence).toBe(false);
  });

  it('soma também as secretarias extras (qtd_outras)', () => {
    const result = resolveItemQuantity(itemByNumber(4));
    expect(result.quantity).toBe(20);
    expect(result.rateioSum).toBe(20);
  });

  it('prevalece sobre a célula e marca divergência (bug do "3.951")', () => {
    const item = itemByNumber(3);
    expect(item.qt_celula).toBe(3.951);

    const result = resolveItemQuantity(item);
    expect(result.quantity).toBe(3951); // soma do rateio, nunca a célula
    expect(result.source).toBe('rateio');
    expect(result.divergence).toBe(true);
  });

  it('cai na célula e sinaliza quando o rateio está vazio', () => {
    const result = resolveItemQuantity({
      ...itemByNumber(1),
      qtd_sdsp: 0,
      qtd_spdc: 0,
      qtd_outras: 0,
      qt: 100,
      qt_celula: 100,
    });

    expect(result).toEqual({
      quantity: 100,
      source: 'cell',
      divergence: true,
      rateioSum: 0,
    });
  });

  it('marca divergência quando a célula é zero e o rateio tem valor', () => {
    const result = resolveItemQuantity({
      ...itemByNumber(1),
      qt_celula: 0,
      qtd_sdsp: 100,
    });
    expect(result.quantity).toBe(100);
    expect(result.divergence).toBe(true);
  });
});
