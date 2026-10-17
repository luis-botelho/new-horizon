// Árvore de pastas do padrão da empresa (docs/handoff/04_ESTRUTURA_PASTAS.md).
// A estrutura é gerada como lista de entradas (diretórios e arquivos) que as
// camadas de escrita (File System Access ou ZIP) materializam de forma
// idempotente — reexportar sobre a mesma pasta não duplica nada.
import type { EditalParsed } from '@/shared/types/edital';

import { LEIA_ME_FILENAME, buildTextArtifacts } from '../rules/txtGuides';
import { buildWorkbookName } from '../spreadsheet/generateWorkbook';

export const EDITAL_DIR = '1- EDITAL';
export const COTACAO_DIR = '2- COTAÇÃO';
export const COTACAO_SUBDIR_COUNT = 3;
export const DOCUMENTACAO_DIR = '3- DOCUMENTAÇÃO';
export const ANEXOS_DIR = '4- ANEXOS';

export type ExportContent = string | Uint8Array | ArrayBuffer | Blob;

export interface ExportEntry {
  /** Segmentos do caminho relativo à pasta raiz (1..n). */
  segments: string[];
  /** Ausente = diretório (criado mesmo quando vazio). */
  content?: ExportContent;
}

/**
 * Monta a árvore completa: pastas vazias de editais/cotações/anexos, a
 * planilha mestra em `2- COTAÇÃO/`, os TXTs em `3- DOCUMENTAÇÃO/` e o
 * LEIA-ME na raiz. `workbook` é o binário (.xlsx) já gerado.
 */
export function buildExportTree(
  parsed: EditalParsed,
  rootFolderName: string,
  workbook: ExportContent,
): ExportEntry[] {
  const entries: ExportEntry[] = [
    { segments: [EDITAL_DIR] },
    { segments: [COTACAO_DIR] },
    ...Array.from({ length: COTACAO_SUBDIR_COUNT }, (_, index) => ({
      segments: [COTACAO_DIR, `COTAÇÃO ${index + 1}`],
    })),
    { segments: [COTACAO_DIR, buildWorkbookName(parsed)], content: workbook },
    { segments: [DOCUMENTACAO_DIR] },
    { segments: [DOCUMENTACAO_DIR, ANEXOS_DIR] },
  ];

  for (const artifact of buildTextArtifacts(parsed, rootFolderName)) {
    const segments =
      artifact.filename === LEIA_ME_FILENAME
        ? [artifact.filename]
        : [DOCUMENTACAO_DIR, artifact.filename];
    entries.push({ segments, content: artifact.content });
  }

  return entries;
}
