import { describe, expect, it } from 'vitest';

import type { DirectoryHandleLike, FileHandleLike, WritableFile } from './writeDirectory';
import { writeTreeToDirectory } from './writeDirectory';
import type { ExportEntry } from './tree';

class MemoryWritable implements WritableFile {
  chunks: (string | Blob | BufferSource)[] = [];
  closed = false;

  async write(data: string | Blob | BufferSource): Promise<void> {
    this.chunks.push(data);
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

class MemoryFile {
  readonly writables: MemoryWritable[] = [];

  async createWritable(): Promise<WritableFile> {
    const writable = new MemoryWritable();
    this.writables.push(writable);
    return writable;
  }

  text(): string {
    return this.writables
      .flatMap((writable) => writable.chunks)
      .map((chunk) =>
        typeof chunk === 'string'
          ? chunk
          : `<bin:${chunk instanceof Blob ? chunk.size : chunk.byteLength}>`,
      )
      .join('');
  }
}

class MemoryDirectory implements DirectoryHandleLike {
  readonly dirs = new Map<string, MemoryDirectory>();
  readonly files = new Map<string, MemoryFile>();

  async getDirectoryHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<DirectoryHandleLike> {
    const existing = this.dirs.get(name);
    if (existing) return existing;
    if (!options?.create) throw new Error(`NotFoundError: ${name}`);
    const created = new MemoryDirectory();
    this.dirs.set(name, created);
    return created;
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike> {
    const existing = this.files.get(name);
    if (existing) return existing;
    if (!options?.create) throw new Error(`NotFoundError: ${name}`);
    const created = new MemoryFile();
    this.files.set(name, created);
    return created;
  }
}

const ENTRIES: ExportEntry[] = [
  { segments: ['1- EDITAL'] },
  { segments: ['2- COTAÇÃO'] },
  { segments: ['2- COTAÇÃO', 'COTAÇÃO 1'] },
  { segments: ['2- COTAÇÃO', '5522026.xlsx'], content: new Uint8Array([1, 2, 3]) },
  { segments: ['3- DOCUMENTAÇÃO', '00 - GUIA.txt'], content: 'guia' },
  { segments: ['LEIA-ME.txt'], content: 'ola' },
];

describe('writeTreeToDirectory', () => {
  it('cria pastas aninhadas e grava arquivos de texto e binário', async () => {
    const root = new MemoryDirectory();
    const result = await writeTreeToDirectory(root, ENTRIES);

    expect(result.filesWritten).toBe(3);
    expect(root.dirs.has('1- EDITAL')).toBe(true);
    expect(root.dirs.get('2- COTAÇÃO')?.dirs.has('COTAÇÃO 1')).toBe(true);

    const cotacao = root.dirs.get('2- COTAÇÃO');
    expect(cotacao?.files.get('5522026.xlsx')?.writables[0]?.closed).toBe(true);
    expect(root.files.get('LEIA-ME.txt')?.text()).toBe('ola');
    expect(root.dirs.get('3- DOCUMENTAÇÃO')?.files.get('00 - GUIA.txt')?.text()).toBe('guia');
  });

  it('é idempotente: reexecutar sobrescreve sem duplicar pastas', async () => {
    const root = new MemoryDirectory();
    await writeTreeToDirectory(root, ENTRIES);
    const second = await writeTreeToDirectory(root, ENTRIES);

    expect(second.filesWritten).toBe(3);
    expect(root.dirs.size).toBe(3);
    expect(root.dirs.get('2- COTAÇÃO')?.dirs.size).toBe(1);
    // Sobrescreve: dois writables no mesmo arquivo, o último vence.
    expect(root.files.get('LEIA-ME.txt')?.writables).toHaveLength(2);
  });

  it('resolve cada subpasta uma única vez (cache de diretórios)', async () => {
    const root = new MemoryDirectory();
    // Duas entradas no mesmo diretório: a segunda não deve recriar.
    const result = await writeTreeToDirectory(root, [
      { segments: ['docs', 'a.txt'], content: 'a' },
      { segments: ['docs', 'b.txt'], content: 'b' },
    ]);
    expect(result.directoriesCreated).toBe(1);
    expect(result.filesWritten).toBe(2);
  });
});
