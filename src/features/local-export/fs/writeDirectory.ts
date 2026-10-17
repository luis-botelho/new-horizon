// Escrita da árvore via File System Access API (Chrome/Edge desktop).
// A árvore é percorrida contra uma interface mínima (DirectoryHandleLike) para
// permitir teste em memória e para não amarrar o módulo ao DOM.
import type { ExportEntry } from './tree';

export interface WritableFile {
  write(data: Blob | string | BufferSource): Promise<void>;
  close(): Promise<void>;
}

export interface FileHandleLike {
  createWritable(): Promise<WritableFile>;
}

export interface DirectoryHandleLike {
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandleLike>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike>;
}

export interface WriteTreeResult {
  filesWritten: number;
  directoriesCreated: number;
}

/**
 * Materializa as entradas a partir de `root`. Diretórios são criados com
 * `create: true` (idempotente); arquivos existentes são sobrescritos.
 */
export async function writeTreeToDirectory(
  root: DirectoryHandleLike,
  entries: readonly ExportEntry[],
): Promise<WriteTreeResult> {
  let filesWritten = 0;
  let directoriesCreated = 0;
  const directoryCache = new Map<string, DirectoryHandleLike>();

  const resolveDirectory = async (segments: readonly string[]): Promise<DirectoryHandleLike> => {
    const cacheKey = segments.join('/');
    const cached = directoryCache.get(cacheKey);
    if (cached) return cached;

    let current = root;
    for (const segment of segments) {
      current = await current.getDirectoryHandle(segment, { create: true });
      directoriesCreated += 1;
    }
    directoryCache.set(cacheKey, current);
    return current;
  };

  for (const entry of entries) {
    const fileName = entry.segments.at(-1);
    if (!fileName) continue;

    // Diretório (sem conteúdo): garante o próprio diretório, não só o pai.
    if (entry.content === undefined) {
      await resolveDirectory(entry.segments);
      continue;
    }

    const parent = await resolveDirectory(entry.segments.slice(0, -1));
    const fileHandle = await parent.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(entry.content);
    await writable.close();
    filesWritten += 1;
  }

  return { filesWritten, directoriesCreated };
}
