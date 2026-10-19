// Modelo da etapa de revisão: a meta vira um form de strings para os campos
// serem editáveis sem brigar com `exactOptionalPropertyTypes` (campo numérico
// vazio é `''`, nunca `undefined`). Na validação do export o form volta a virar
// objeto de contrato e o Zod faz a checagem de verdade.
import { resolveItemQuantity } from '@/shared/lib/quantity';
import type { EditalItem, EditalMeta } from '@/shared/types/edital';

/** Todos os campos da meta como string — é o que os inputs de texto devolvem. */
export type MetaForm = { [K in keyof EditalMeta]: string };

function numberOf(value: number | undefined): string {
  return value == null ? '' : String(value);
}

/** Meta parcial (PDF) ou completa (JSON) → form preenchido. */
export function metaToForm(meta: Partial<EditalMeta>): MetaForm {
  return {
    pregao: meta.pregao ?? '',
    pncp: meta.pncp ?? '',
    processo_sei: meta.processo_sei ?? '',
    uasg: meta.uasg ?? '',
    orgao: meta.orgao ?? '',
    objeto: meta.objeto ?? '',
    sessao: meta.sessao ?? '',
    plataforma: meta.plataforma ?? '',
    criterio: meta.criterio ?? '',
    modo: meta.modo ?? '',
    orcamento: meta.orcamento ?? '',
    validade_proposta_dias: numberOf(meta.validade_proposta_dias),
    entrega_dias: numberOf(meta.entrega_dias),
    pagamento_dias: numberOf(meta.pagamento_dias),
    garantia_meses: numberOf(meta.garantia_meses),
    observacoes: meta.observacoes ?? '',
  };
}

/** Um campo alterado. Nada de `undefined`: o form só tem strings. */
export function patchForm<K extends keyof MetaForm>(form: MetaForm, key: K, value: string): MetaForm {
  const next: MetaForm = { ...form };
  next[key] = value;
  return next;
}

/** Valor numérico do form para o contrato; vazio/lixo vira 0 e o Zod reclama. */
function toNumber(raw: string): number {
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Form → meta candidata ao `editalParsedSchema`. O tipo é `EditalMeta`, mas os
 * valores ainda não passaram na validação: é o parse do export que decide.
 */
export function formToMeta(form: MetaForm): EditalMeta {
  return {
    pregao: form.pregao,
    pncp: form.pncp,
    processo_sei: form.processo_sei,
    uasg: form.uasg,
    orgao: form.orgao,
    objeto: form.objeto,
    sessao: form.sessao,
    plataforma: form.plataforma,
    criterio: form.criterio,
    modo: form.modo,
    orcamento: form.orcamento,
    validade_proposta_dias: toNumber(form.validade_proposta_dias),
    entrega_dias: toNumber(form.entrega_dias),
    pagamento_dias: toNumber(form.pagamento_dias),
    garantia_meses: toNumber(form.garantia_meses),
    observacoes: form.observacoes,
  };
}

/** Item do edital como form de strings; `divergencia` é derivada na conversão. */
export interface ItemForm {
  item: string;
  qt: string;
  qt_celula: string;
  unid: string;
  grupo: string;
  qtd_sdsp: string;
  qtd_spdc: string;
  qtd_outras: string;
  descricao: string;
}

/** Item do contrato (parser/JSON) → form editável. */
export function itemToForm(item: EditalItem): ItemForm {
  return {
    item: String(item.item),
    qt: String(item.qt),
    qt_celula: String(item.qt_celula),
    unid: item.unid,
    grupo: item.grupo,
    qtd_sdsp: String(item.qtd_sdsp),
    qtd_spdc: String(item.qtd_spdc),
    qtd_outras: String(item.qtd_outras),
    descricao: item.descricao,
  };
}

/**
 * Form → item candidato ao `editalParsedSchema`, aplicando a regra de ouro:
 * `qt` vem da soma do rateio quando existe; sem rateio, do valor original.
 * `divergencia` é sempre recalculada — nunca se confia na flag vinda do form.
 */
export function itemFormToItem(form: ItemForm): EditalItem {
  const base: EditalItem = {
    item: toNumber(form.item),
    qt: 0,
    qt_celula: toNumber(form.qt_celula),
    unid: form.unid,
    grupo: form.grupo,
    qtd_sdsp: toNumber(form.qtd_sdsp),
    qtd_spdc: toNumber(form.qtd_spdc),
    qtd_outras: toNumber(form.qtd_outras),
    divergencia: false,
    descricao: form.descricao,
  };
  const resolved = resolveItemQuantity({ ...base, qt: toNumber(form.qt) });
  return { ...base, qt: resolved.quantity, divergencia: resolved.divergence };
}

const RATEIO_KEYS: ReadonlySet<string> = new Set(['qtd_sdsp', 'qtd_spdc', 'qtd_outras']);

/** Um campo de um item alterado. Rateio editado reconcilia célula e qt. */
export function patchItemForm<K extends keyof ItemForm>(
  items: ItemForm[],
  index: number,
  key: K,
  value: string,
): ItemForm[] {
  return items.map((form, position) => {
    if (position !== index) return form;
    const next: ItemForm = { ...form };
    next[key] = value;
    if (RATEIO_KEYS.has(key)) {
      // O humano mexeu no rateio: a célula passa a valer a soma nova e o
      // aviso de divergência some — ele já conferiu.
      const sum = toNumber(next.qtd_sdsp) + toNumber(next.qtd_spdc) + toNumber(next.qtd_outras);
      next.qt = String(sum);
      next.qt_celula = String(sum);
    }
    return next;
  });
}

/** Linha nova em branco: números vazios (o Zod aponta o que falta no export). */
export function emptyItemForm(itemNumber: number): ItemForm {
  return {
    item: String(itemNumber),
    qt: '',
    qt_celula: '',
    unid: '',
    grupo: '',
    qtd_sdsp: '',
    qtd_spdc: '',
    qtd_outras: '',
    descricao: '',
  };
}

/** Próximo número de item: maior número atual + 1 (ou 1 se não houver). */
export function nextItemNumber(items: ItemForm[]): number {
  const numbers = items.map((form) => toNumber(form.item));
  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}
