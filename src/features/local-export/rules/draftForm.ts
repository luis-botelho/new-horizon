// Modelo da etapa de revisão: a meta vira um form de strings para os campos
// serem editáveis sem brigar com `exactOptionalPropertyTypes` (campo numérico
// vazio é `''`, nunca `undefined`). Na validação do export o form volta a virar
// objeto de contrato e o Zod faz a checagem de verdade.
import type { EditalMeta } from '@/shared/types/edital';

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
