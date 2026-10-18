// Extração do cabeçalho do edital (meta) a partir do texto normalizado e
// sem cabeçalhos de página. Padrões validados contra o edital real do
// Pregão Eletrônico 90.070/2026 (fixture editalTextSample.ts).
//
// Política de escolha quando o documento repete o mesmo campo:
// - escolhas (critério, modo, orçamento, órgão, objeto, sessão): PRIMEIRO
//   ocorrência — a cláusula definitória vem antes das repetições em anexos;
// - números de prazo: ÚLTIMO valor distinto, com aviso de conflito — editais
//   repetem o prazo no Termo de Referência e lá operacionalizam o valor
//   (caso real: cláusula 6.5 diz 60 dias, TR 5.3 diz 90; a empresa usa 90).
// Tudo que é obrigatório e não aparecer vira issue para a revisão manual.
import type { EditalMeta } from '@/shared/types/edital';

const PREGAO_CONTEXT =
  /PREGÃO ELETRÔNICO(?: PARA REGISTRO DE PREÇOS)?[^0-9]{0,60}N[º°]\s*([\d.]+\/\d{4})/u;
const PREGAO_FALLBACK = /N[º°]\s*(\d{1,3}(?:\.\d{1,3}){1,2}\/\d{4})/u;
const PNCP_EDITAL = /EDITAL NO PNCP\s+(\d+\/\d{4})/u;
const UASG_PNCP = /UASG NO PNCP\s+(\d+)/u;
const PROCESSO_SEI = /Processo\s+n[º°]\s*(SEI-[\d-]+)/u;
const ORGAO_PREFEITURA = /Prefeitura Municipal de ([^\n,.;:]{2,60})/iu;
const ORGAO_MUNICIPIO = /[Mm]unicípio de ([A-ZÀ-Ú][^\n,.;:]{2,60})/u;
const OBJETO =
  /\b((?:aquisição|contratação|fornecimento|prestação de serviços)\s+de\s+[^.]{5,140}?)\s+para\s+atender\b/iu;
const SESSAO_EXTENSA =
  /\bNo\s+dia\s+(\d{1,2})\s+de\s+(\p{L}+)\s+de\s+(\d{4}),?\s+[àa]s\s+(\d{1,2}):(\d{2})/u;
const SESSAO_NUMERICA = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\s*,?\s+[àa]s\s+(\d{1,2}):(\d{2})/u;
const CRITERIO = /[Cc]rit[ée]rio de julgamento\s+([A-ZÀ-Ú][^a-z]{2,40})/u;
const MODO = /MODO DE DISPUTA:?\s*([A-Z]{4,20})/u;
const ORCAMENTO = /\bORÇAMENTO\s*:?\s*([A-Z]{3,15})/u;
// Portal do edital: marca ComprasGov citada ou a URL gov.br/compras (onde a
// sessão acontece) apontam para a mesma plataforma.
const PLATAFORMA = /\bComprasGov\b|gov\.br\/compras/iu;
const VALIDADE = /validade[^\d]{0,60}(\d{1,2})\s*\(/gu;
const ENTREGA = /prazo\s+de\s+entrega[^\d]{0,60}(\d{1,2})\s*\(/gu;
const PAGAMENTO = /pagamento[^\d]{0,90}(\d{1,2})\s*\([^)]{0,30}\)\s*dias/giu;
const GARANTIA_CONVENCIONAL = /garantia\s+convencional[^\d]{0,60}(\d{1,2})\s*\(/giu;
const GARANTIA_MESES = /garantia[^\d]{0,50}(\d{1,2})\s*\([^)]{0,25}\)\s*meses/giu;

const MONTH_NUMBER: Record<string, string> = {
  janeiro: '01',
  fevereiro: '02',
  março: '03',
  abril: '04',
  maio: '05',
  junho: '06',
  julho: '07',
  agosto: '08',
  setembro: '09',
  outubro: '10',
  novembro: '11',
  dezembro: '12',
};

const ORGAO_CONNECTORS = new Set([
  'a', 'as', 'com', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'na', 'nas',
  'no', 'nos', 'o', 'os', 'para', 'por',
]);

function titleCaseWords(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && ORGAO_CONNECTORS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function pad(value: string): string {
  return value.padStart(2, '0');
}

function extractSessao(text: string): string | undefined {
  const extensa = text.match(SESSAO_EXTENSA);
  if (extensa) {
    const [, day, monthName, year, hour, minute] = extensa;
    const month = monthName ? MONTH_NUMBER[monthName.toLowerCase()] : undefined;
    if (day && month && year && hour && minute) {
      return `${year}-${month}-${pad(day)}T${pad(hour)}:${minute}`;
    }
  }
  const numerica = text.match(SESSAO_NUMERICA);
  if (numerica) {
    const [, day, month, year, hour, minute] = numerica;
    if (day && month && year && hour && minute) {
      return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${minute}`;
    }
  }
  return undefined;
}

/** Coleta todos os valores numéricos dos padrões, em ordem do documento. */
function collectNumbers(text: string, patterns: RegExp[]): number[] {
  const found: { value: number; index: number }[] = [];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const group = match[1];
      if (group === undefined) continue;
      const value = Number(group);
      if (Number.isFinite(value)) found.push({ value, index: match.index });
    }
  }
  return found
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.value);
}

function resolveNumberField(
  label: string,
  candidates: number[],
  issues: string[],
): number | undefined {
  if (candidates.length === 0) {
    issues.push(`${label} não encontrado no texto — preencha na revisão.`);
    return undefined;
  }
  const distinct = Array.from(new Set(candidates));
  const last = distinct[distinct.length - 1];
  if (last === undefined) return undefined;
  if (distinct.length > 1) {
    issues.push(
      `${label}: valores divergentes no documento (${distinct.join(', ')}) — usando ${last}; confirme na revisão.`,
    );
  }
  return last;
}

/**
 * Extrai o que conseguir do cabeçalho do edital. `meta` pode ficar parcial:
 * a etapa de revisão do fluxo permite completar o que o texto não traz.
 */
export function parseMeta(text: string, issues: string[]): Partial<EditalMeta> {
  const meta: Partial<EditalMeta> = {};

  const pregao = text.match(PREGAO_CONTEXT)?.[1] ?? text.match(PREGAO_FALLBACK)?.[1];
  if (pregao) {
    meta.pregao = pregao;
  } else {
    issues.push('pregão não encontrado no texto — preencha na revisão.');
  }

  const pncp = text.match(PNCP_EDITAL)?.[1];
  if (pncp) meta.pncp = pncp;
  const uasg = text.match(UASG_PNCP)?.[1];
  if (uasg) meta.uasg = uasg;
  const processo = text.match(PROCESSO_SEI)?.[1];
  if (processo) meta.processo_sei = processo;

  // Órgão: editais de município identificam a licitante na prosa como
  // "Município de X"; o prefixo vira "Prefeitura Municipal de X" (heurística
  // revisável na etapa de revisão).
  const orgaoRaw =
    text.match(ORGAO_PREFEITURA)?.[1] ?? text.match(ORGAO_MUNICIPIO)?.[1];
  if (orgaoRaw) {
    meta.orgao = `Prefeitura Municipal de ${titleCaseWords(orgaoRaw.trim())}`;
  } else {
    issues.push('órgão não encontrado no texto — preencha na revisão.');
  }

  const objeto = text.match(OBJETO)?.[1]?.replace(/\s+/g, ' ').trim();
  if (objeto) {
    meta.objeto = objeto;
  } else {
    issues.push('objeto não encontrado no texto — preencha na revisão.');
  }

  const sessao = extractSessao(text);
  if (sessao) {
    meta.sessao = sessao;
  } else {
    issues.push('sessão não encontrada no texto — preencha na revisão.');
  }

  const criterio = text.match(CRITERIO)?.[1]?.trim();
  if (criterio) meta.criterio = criterio;
  const modo = text.match(MODO)?.[1];
  if (modo) meta.modo = modo;
  const orcamento = text.match(ORCAMENTO)?.[1];
  if (orcamento) meta.orcamento = orcamento;
  if (PLATAFORMA.test(text)) meta.plataforma = 'gov.br / ComprasGov';

  const validade = resolveNumberField(
    'validade da proposta',
    collectNumbers(text, [VALIDADE]),
    issues,
  );
  if (validade !== undefined) meta.validade_proposta_dias = validade;

  const entrega = resolveNumberField(
    'prazo de entrega',
    collectNumbers(text, [ENTREGA]),
    issues,
  );
  if (entrega !== undefined) meta.entrega_dias = entrega;

  const pagamento = resolveNumberField(
    'prazo de pagamento',
    collectNumbers(text, [PAGAMENTO]),
    issues,
  );
  if (pagamento !== undefined) meta.pagamento_dias = pagamento;

  const garantia = resolveNumberField(
    'garantia',
    collectNumbers(text, [GARANTIA_CONVENCIONAL, GARANTIA_MESES]),
    issues,
  );
  if (garantia !== undefined) meta.garantia_meses = garantia;

  return meta;
}
