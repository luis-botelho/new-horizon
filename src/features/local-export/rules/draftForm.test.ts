import { describe, expect, it } from 'vitest';

import type { EditalMeta } from '@/shared/types/edital';

import { formToMeta, metaToForm, patchForm } from './draftForm';

const META: EditalMeta = {
  pregao: '90.070/2026',
  pncp: '00000000000000009000702026',
  processo_sei: 'SEI-2025-06001343',
  uasg: '985801',
  orgao: 'Prefeitura Municipal de Angra dos Reis',
  objeto: 'Aquisição de materiais de limpeza',
  sessao: '2026-10-16T10:00',
  plataforma: 'ComprasNet',
  criterio: 'Menor preço global',
  modo: 'Aberto',
  orcamento: 'R$ 100.000,00',
  validade_proposta_dias: 90,
  entrega_dias: 20,
  pagamento_dias: 30,
  garantia_meses: 12,
  observacoes: 'Conforme termo de referência.',
};

describe('metaToForm', () => {
  it('converte números para string sem perder nada', () => {
    const form = metaToForm(META);
    expect(form.validade_proposta_dias).toBe('90');
    expect(form.garantia_meses).toBe('12');
    expect(form.sessao).toBe('2026-10-16T10:00');
  });

  it('meta parcial vira form vazio (PDF sem campo achado)', () => {
    const form = metaToForm({ pregao: '90.070/2026' });
    expect(form.pregao).toBe('90.070/2026');
    expect(form.orgao).toBe('');
    expect(form.entrega_dias).toBe('');
  });
});

describe('patchForm', () => {
  it('atualiza só o campo pedido sem mutar o form anterior', () => {
    const form = metaToForm(META);
    const next = patchForm(form, 'orgao', 'Câmara dos Deputados');
    expect(next.orgao).toBe('Câmara dos Deputados');
    expect(form.orgao).toBe(META.orgao);
    expect(next.pregao).toBe(form.pregao);
  });
});

describe('formToMeta', () => {
  it('roundtrip completo devolve a meta original', () => {
    expect(formToMeta(metaToForm(META))).toEqual(META);
  });

  it('campo numérico vazio vira 0 (o Zod rejeita com a mensagem do campo)', () => {
    const meta = formToMeta(metaToForm({ pregao: '90.070/2026', orgao: 'X', objeto: 'Y' }));
    expect(meta.entrega_dias).toBe(0);
    expect(meta.pregao).toBe('90.070/2026');
  });

  it('lixo não numérico vira 0 em vez de NaN', () => {
    let form = metaToForm(META);
    form = patchForm(form, 'pagamento_dias', '');
    form = patchForm(form, 'entrega_dias', 'abc');
    const meta = formToMeta(form);
    expect(meta.pagamento_dias).toBe(0);
    expect(meta.entrega_dias).toBe(0);
  });
});
