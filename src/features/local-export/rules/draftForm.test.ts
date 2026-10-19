import { describe, expect, it } from 'vitest';

import type { EditalItem, EditalMeta } from '@/shared/types/edital';

import {
  emptyItemForm,
  formToMeta,
  itemFormToItem,
  itemToForm,
  metaToForm,
  nextItemNumber,
  patchForm,
  patchItemForm,
} from './draftForm';

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

const ITEM_RATEIO: EditalItem = {
  item: 12,
  qt: 3551,
  qt_celula: 400,
  unid: 'Unid.',
  grupo: '',
  qtd_sdsp: 20,
  qtd_spdc: 3531,
  qtd_outras: 0,
  divergencia: true,
  descricao: 'Capa protetora',
};

const ITEM_SEM_RATEIO: EditalItem = {
  item: 3,
  qt: 7,
  qt_celula: 7,
  unid: 'Cx',
  grupo: '',
  qtd_sdsp: 0,
  qtd_spdc: 0,
  qtd_outras: 0,
  divergencia: true,
  descricao: 'Fita crepe',
};

describe('itemToForm / itemFormToItem', () => {
  it('roundtrip preserva item com divergência (célula ≠ soma do rateio)', () => {
    expect(itemFormToItem(itemToForm(ITEM_RATEIO))).toEqual(ITEM_RATEIO);
  });

  it('roundtrip preserva item sem rateio (qt vem do valor original)', () => {
    expect(itemFormToItem(itemToForm(ITEM_SEM_RATEIO))).toEqual(ITEM_SEM_RATEIO);
  });
});

describe('patchItemForm', () => {
  it('editar rateio reconcilia célula e qt (some o aviso de divergência)', () => {
    const items = [itemToForm(ITEM_RATEIO)];
    const next = patchItemForm(items, 0, 'qtd_sdsp', '25');
    expect(next[0]).toMatchObject({ qtd_sdsp: '25', qt_celula: '3556', qt: '3556' });
    const [reconciled] = next;
    expect(reconciled && itemFormToItem(reconciled).divergencia).toBe(false);
    // O form anterior não é mutado.
    expect(items[0]).toMatchObject({ qt_celula: '400', qt: '3551' });
  });

  it('edição de texto não mexe nas quantidades', () => {
    const next = patchItemForm([itemToForm(ITEM_RATEIO)], 0, 'descricao', 'Capa 3 mm');
    expect(next[0]).toMatchObject({ descricao: 'Capa 3 mm', qt_celula: '400', qt: '3551' });
  });

  it('só a linha pedida muda', () => {
    const items = [itemToForm(ITEM_RATEIO), itemToForm(ITEM_SEM_RATEIO)];
    const next = patchItemForm(items, 1, 'qtd_sdsp', '7');
    expect(next[0]).toEqual(items[0]);
    expect(next[1]).toMatchObject({ qt_celula: '7', qt: '7' });
  });
});

describe('emptyItemForm / nextItemNumber', () => {
  it('linha nova fica vazia e o número vem do maior item + 1', () => {
    const items = [itemToForm(ITEM_RATEIO), itemToForm(ITEM_SEM_RATEIO)];
    expect(nextItemNumber(items)).toBe(13);
    const nova = emptyItemForm(13);
    expect(nova).toMatchObject({ item: '13', unid: '', descricao: '' });
    expect(itemFormToItem(nova).qt).toBe(0);
  });

  it('sem itens, o primeiro número é 1', () => {
    expect(nextItemNumber([])).toBe(1);
  });
});
