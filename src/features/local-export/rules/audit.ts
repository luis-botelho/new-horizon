// Conferência guia × arquivos (HANDOFF: "casar guia × arquivos e alertar
// faltantes"): bate o catálogo de habilitação (seções A–E, documentCatalog.ts)
// com os nomes dos arquivos de uma pasta (ex.: 3- DOCUMENTAÇÃO) e sinaliza
//   - o que NÃO foi encontrado (faltantes);
//   - o que está vencido ou a vencer (via documentExpiry.ts, lendo a data
//     no padrão "NN - NOME DD-MM-AAAA.pdf").
// Comparação por substring normalizada (sem acento, minúsculas) porque os
// nomes reais saem em caixa alta sem acento ("CERTIDAO NEGATIVA DE
// DEBITOS..."). Heurística — alerta para conferência humana, não veredito.
// Arquivos ocultos e lixo de sistema não contam.

import { evaluateDocumentExpiry, type DocumentExpiry } from './documentExpiry';
import { HABILITACAO_SECTIONS, type ChecklistEntry } from './documentCatalog';

export type AuditStatus = 'found' | 'missing';

export interface AuditedFile {
  /** Caminho relativo escolhido (ex.: "Atestado tec/atestado.pdf"). */
  path: string;
  expiry: DocumentExpiry;
}

export interface AuditedEntry {
  text: string;
  status: AuditStatus;
  /** Arquivos casados, vencidos primeiro; vazio quando `missing`. */
  files: AuditedFile[];
}

export interface AuditedSection {
  code: string;
  title: string;
  entries: AuditedEntry[];
}

export interface FolderAudit {
  sections: AuditedSection[];
  /** Total de itens do checklist (seções A–E). */
  total: number;
  found: number;
  missing: number;
  /** Arquivos casados vencidos (status 'expired'). */
  expired: number;
  /** Arquivos casados vencendo em até o limiar do documentExpiry. */
  expiring: number;
}

/** Remove acento e baixa caixa: "Certidão" → "certidao". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function basename(path: string): string {
  const index = path.lastIndexOf('/');
  return index === -1 ? path : path.slice(index + 1);
}

/** Ocultos (.DS_Store, .arquivo) e lixo de sistema não viram evidência. */
function isRelevant(path: string): boolean {
  const name = basename(path);
  if (name.startsWith('.')) return false;
  return name.toLowerCase() !== 'desktop.ini';
}

function matchEntry(entry: ChecklistEntry, paths: string[]): string[] {
  const keywords = entry.keywords.map(normalize);
  return paths.filter((path) => {
    const normalized = normalize(path);
    return keywords.some((keyword) => normalized.includes(keyword));
  });
}

/** Ordena para leitura: vencido → vencendo → válido → sem data, depois A→Z. */
function expiryRank(expiry: DocumentExpiry): number {
  if (expiry.status === 'expired') return 0;
  if (expiry.status === 'expiring') return 1;
  if (expiry.status === 'valid') return 2;
  return 3;
}

/**
 * Audita os arquivos de uma pasta contra o catálogo de habilitação.
 * @param paths caminhos relativos dos arquivos (FileList do seletor de pasta)
 * @param today data de referência (chamador injeta — função pura/testável)
 */
export function auditHabilitacao(paths: string[], today: Date): FolderAudit {
  const relevant = paths.filter(isRelevant);

  let found = 0;
  let missing = 0;
  const seenFiles = new Map<string, DocumentExpiry>();
  const sections: AuditedSection[] = HABILITACAO_SECTIONS.map((section) => ({
    code: section.code,
    title: section.title,
    entries: section.entries.map((entry) => {
      const matches = matchEntry(entry, relevant);
      const files: AuditedFile[] = matches
        .map((path) => ({ path, expiry: evaluateDocumentExpiry(basename(path), today) }))
        .sort(
          (a, b) =>
            expiryRank(a.expiry) - expiryRank(b.expiry) || a.path.localeCompare(b.path),
        );

      for (const file of files) seenFiles.set(file.path, file.expiry);

      if (files.length > 0) found += 1;
      else missing += 1;

      return { text: entry.text, status: files.length > 0 ? 'found' : 'missing', files };
    }),
  }));

  let expired = 0;
  let expiring = 0;
  for (const expiry of seenFiles.values()) {
    if (expiry.status === 'expired') expired += 1;
    else if (expiry.status === 'expiring') expiring += 1;
  }

  return {
    sections,
    total: found + missing,
    found,
    missing,
    expired,
    expiring,
  };
}
