import { afterEach, describe, expect, it, vi } from 'vitest';

import { detectExportMode } from './capabilities';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectExportMode', () => {
  it('usa zip quando não há window (SSR/node)', () => {
    expect(detectExportMode()).toBe('zip');
  });

  it('usa zip quando a API de diretório não existe (Firefox/Safari)', () => {
    vi.stubGlobal('window', {});
    expect(detectExportMode()).toBe('zip');
  });

  it('usa File System Access quando disponível (Chromium)', () => {
    vi.stubGlobal('window', { showDirectoryPicker: async () => undefined });
    expect(detectExportMode()).toBe('file-system-access');
  });
});
