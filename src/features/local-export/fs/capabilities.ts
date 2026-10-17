// Detecção do mecanismo de exportação disponível no navegador.
export type ExportMode = 'file-system-access' | 'zip';

/**
 * File System Access API só existe em Chromium desktop. Nos demais (e no
 * SSR) usamos o fallback .zip. A UI decide com base neste modo e explica ao
 * usuário o que vai acontecer.
 */
export function detectExportMode(): ExportMode {
  const hasFileSystemAccess =
    typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  return hasFileSystemAccess ? 'file-system-access' : 'zip';
}
