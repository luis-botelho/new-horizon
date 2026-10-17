// Fallback para navegadores sem File System Access API (Firefox/Safari):
// gera um .zip com a mesma árvore e o usuário baixa e descompacta.
import JSZip from 'jszip';

import type { ExportContent, ExportEntry } from './tree';

export async function buildZipBlob(entries: readonly ExportEntry[]): Promise<Blob> {
  const zip = new JSZip();

  for (const entry of entries) {
    const path = entry.segments.join('/');
    if (entry.content === undefined) {
      // Garante a pasta mesmo vazia (ex.: "1- EDITAL/").
      zip.folder(path);
    } else {
      zip.file(path, entry.content);
    }
  }

  return zip.generateAsync({ type: 'blob' });
}

/** Converte o conteúdo de uma entrada em Blob (útil para download direto). */
export function contentToBlob(content: ExportContent, mimeType: string): Blob {
  if (content instanceof Blob) return content;
  if (typeof content === 'string') return new Blob([content], { type: `${mimeType};charset=utf-8` });
  return new Blob([content as BlobPart], { type: mimeType });
}
