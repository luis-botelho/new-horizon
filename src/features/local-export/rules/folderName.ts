// Nome da pasta raiz no padrão da empresa (docs/handoff/04_ESTRUTURA_PASTAS.md):
//   {NUMERO}-{PREFEITURA}-{TIPO}  com separador " - ", SEMPRE MAIÚSCULO.
// Ex.: "5522026 - PREFEITURA - CAMA MESA".
// O app SEMPRE oferece o nome sugerido e o usuário pode editar antes de criar.
import type { EditalMeta } from '@/shared/types/edital';

/** Caracteres ilegais em nomes de arquivo/pasta no Windows. */
const WINDOWS_ILLEGAL = /[<>:"/\\|?*]/g;
/** Tamanho máximo por segmento — deixa folga para o restante do caminho (MAX_PATH). */
const MAX_SEGMENT_LENGTH = 80;

/**
 * Normaliza um segmento do nome de pasta: remove acentos, caracteres
 * ilegais/controle, colapsa espaços, corta cauda inválida e usa maiúsculas.
 */
export function sanitizeFolderSegment(raw: string): string {
  const normalized = raw
    .normalize('NFKD')
    .replace(/\p{M}/gu, '') // diacríticos compostos (á → a)
    .replace(/\p{Cc}/gu, ' ') // caracteres de controle ilegais em nomes
    .replace(WINDOWS_ILLEGAL, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '')
    .toUpperCase();

  return normalized.slice(0, MAX_SEGMENT_LENGTH).trim();
}

export interface RootFolderNameParts {
  /** Número do certame, ex.: "552/2026" (pncp) ou "90.070/2026" (pregão). */
  numero: string;
  /** Órgão (sugestão: `suggestOrgaoSegment`) ou município. */
  orgao: string;
  /** Tipo/material resumido, ex.: "Cama Mesa". */
  tipo: string;
}

/**
 * Monta o nome da pasta raiz. Segmentos que se tornarem vazios após a
 * sanitização são descartados (defesa contra "5522026 -  - CAMA").
 */
export function buildRootFolderName(parts: RootFolderNameParts): string {
  const segments = [
    sanitizeFolderSegment(parts.numero),
    sanitizeFolderSegment(parts.orgao),
    sanitizeFolderSegment(parts.tipo),
  ].filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    throw new Error('nome da pasta raiz ficou vazio após a sanitização');
  }
  return segments.join(' - ');
}

/**
 * Sugestão de número compacto: só dígitos.
 * "552/2026" → "5522026" e "90.070/2026" → "900702026".
 */
export function suggestNumeroSegment(certificateNumber: string): string {
  return certificateNumber.replace(/\D/g, '');
}

/**
 * Sugestão de segmento de tipo/material: até as `maxWords` primeiras palavras
 * do objeto, sem pontuação. "Materiais de limpeza e escritório" →
 * "MATERIAIS DE LIMPEZA".
 */
export function suggestTipoSegment(objeto: string, maxWords = 3): string {
  const words = objeto
    .trim()
    .replace(/[,.:;()/]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords);
  return sanitizeFolderSegment(words.join(' '));
}

/**
 * Sugestão de segmento do órgão: primeira palavra (a variante documentada).
 * "Prefeitura Municipal de Angra dos Reis" → "PREFEITURA".
 * Alternativa prevista no handoff: usar o município ("ANGRADOSREIS").
 */
export function suggestOrgaoSegment(orgao: string): string {
  const firstWord = orgao.trim().split(/\s+/)[0] ?? '';
  return sanitizeFolderSegment(firstWord);
}

/**
 * Sugestão de nome da pasta raiz a partir da meta (parcial na importação por
 * PDF). Se não houver nada aproveitável, devolve '' — o usuário digita.
 */
export function suggestRootFolderName(meta: Partial<EditalMeta>): string {
  const numero = suggestNumeroSegment(meta.pncp || meta.pregao || '');
  const orgao = suggestOrgaoSegment(meta.orgao || '');
  const tipo = suggestTipoSegment(meta.objeto || '');
  if (!numero && !orgao && !tipo) return '';
  return buildRootFolderName({ numero, orgao, tipo });
}
