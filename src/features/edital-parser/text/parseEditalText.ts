// Parser puro de edital em texto: converte o texto extraído de um PDF em
// meta + itens, sinalizando em `issues` tudo que precisar de revisão humana.
// A extração do PDF em si fica em pdf/extractPdfText (aqui só entra string).
import type { EditalItem, EditalMeta } from '@/shared/types/edital';
import { normalizeEditalText, stripPageHeaders } from './cleaning';
import { parseItens } from './parseItens';
import { parseMeta } from './parseMeta';

export interface ParsedEditalText {
  /** Pode ficar parcial: o que faltar é completado na etapa de revisão. */
  meta: Partial<EditalMeta>;
  itens: EditalItem[];
  /** Pontos para revisão humana (campos ausentes, conflitos, rateios). */
  issues: string[];
}

export function parseEditalText(raw: string): ParsedEditalText {
  const issues: string[] = [];
  const normalized = normalizeEditalText(raw);
  // Cabeçalhos de página são removidos ANTES da meta e da tabela: eles são
  // colados no meio do conteúdo ("ABERTOESTADO DO RIO…") e corromperiam
  // campos como modo. O órgão não sofre: vem da prosa "Município de X",
  // que a remoção (só caixa alta) preserva.
  const cleaned = stripPageHeaders(normalized);
  const meta = parseMeta(cleaned, issues);
  const itens = parseItens(cleaned, issues);
  return { meta, itens, issues };
}
