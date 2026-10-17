import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import { buildZipBlob, contentToBlob } from './zipFallback';
import type { ExportEntry } from './tree';

const ENTRIES: ExportEntry[] = [
  { segments: ['1- EDITAL'] },
  { segments: ['2- COTAÇÃO', 'COTAÇÃO 1'] },
  { segments: ['2- COTAÇÃO', 'plano.xlsx'], content: new Uint8Array([80, 75, 3, 4]) },
  { segments: ['LEIA-ME.txt'], content: 'ola' },
];

describe('buildZipBlob', () => {
  it('gera um zip com arquivos e pastas vazias', async () => {
    const blob = await buildZipBlob(ENTRIES);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(Object.keys(zip.files).sort()).toEqual([
      '1- EDITAL/',
      '2- COTAÇÃO/',
      '2- COTAÇÃO/COTAÇÃO 1/',
      '2- COTAÇÃO/plano.xlsx',
      'LEIA-ME.txt',
    ]);
    expect(zip.files['LEIA-ME.txt']?.dir).toBe(false);
    expect(zip.files['1- EDITAL/']?.dir).toBe(true);
    await expect(zip.files['LEIA-ME.txt']?.async('string')).resolves.toBe('ola');
    const binary = await zip.files['2- COTAÇÃO/plano.xlsx']?.async('uint8array');
    expect(binary).toEqual(new Uint8Array([80, 75, 3, 4]));
  });
});

describe('contentToBlob', () => {
  it('converte string com charset UTF-8', async () => {
    const blob = contentToBlob('ção', 'text/plain');
    expect(blob.type).toBe('text/plain;charset=utf-8');
    await expect(blob.text()).resolves.toBe('ção');
  });

  it('repassa Blob e embrulha binário', async () => {
    const original = new Blob(['x']);
    expect(contentToBlob(original, 'text/plain')).toBe(original);

    const binary = contentToBlob(new Uint8Array([1]), 'application/octet-stream');
    expect(binary.size).toBe(1);
    expect(binary.type).toBe('application/octet-stream');
  });
});
