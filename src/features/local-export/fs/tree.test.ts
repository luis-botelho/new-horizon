import { describe, expect, it } from 'vitest';

import { SAMPLE_EDITAL } from '@/shared/types/__fixtures__/editalSample';

import { LEIA_ME_FILENAME } from '../rules/txtGuides';
import { buildWorkbookName } from '../spreadsheet/generateWorkbook';

import {
  ANEXOS_DIR,
  COTACAO_DIR,
  DOCUMENTACAO_DIR,
  EDITAL_DIR,
  buildExportTree,
} from './tree';

const ROOT = '9872026 - PREFEITURA - LIMPEZA';
const WORKBOOK = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

describe('buildExportTree', () => {
  const entries = buildExportTree(SAMPLE_EDITAL, ROOT, WORKBOOK);

  it('cria a árvore canônica do padrão da empresa', () => {
    const paths = entries.map((entry) => entry.segments.join('/'));
    expect(paths).toEqual([
      EDITAL_DIR,
      COTACAO_DIR,
      `${COTACAO_DIR}/COTAÇÃO 1`,
      `${COTACAO_DIR}/COTAÇÃO 2`,
      `${COTACAO_DIR}/COTAÇÃO 3`,
      `${COTACAO_DIR}/${buildWorkbookName(SAMPLE_EDITAL)}`,
      DOCUMENTACAO_DIR,
      `${DOCUMENTACAO_DIR}/${ANEXOS_DIR}`,
      `${DOCUMENTACAO_DIR}/00 - DOCUMENTOS NECESSÁRIOS.txt`,
      `${DOCUMENTACAO_DIR}/00 - GUIA DOS DOCUMENTOS.txt`,
      LEIA_ME_FILENAME,
    ]);
  });

  it('marca pastas vazias sem conteúdo e arquivos com conteúdo', () => {
    const byPath = new Map(entries.map((entry) => [entry.segments.join('/'), entry]));
    expect(byPath.get(EDITAL_DIR)?.content).toBeUndefined();
    expect(byPath.get(`${COTACAO_DIR}/COTAÇÃO 1`)?.content).toBeUndefined();
    expect(byPath.get(`${DOCUMENTACAO_DIR}/${ANEXOS_DIR}`)?.content).toBeUndefined();

    const workbookEntry = byPath.get(`${COTACAO_DIR}/${buildWorkbookName(SAMPLE_EDITAL)}`);
    expect(workbookEntry?.content).toBe(WORKBOOK);

    const leiaMe = byPath.get(LEIA_ME_FILENAME);
    expect(typeof leiaMe?.content).toBe('string');
    expect(String(leiaMe?.content)).toContain(`LEIA-ME - ${ROOT}`);
    expect(String(leiaMe?.content)).toContain('ATENÇÃO: 1 com divergência de rateio');
  });

  it('é determinístico para a mesma entrada', () => {
    const again = buildExportTree(SAMPLE_EDITAL, ROOT, WORKBOOK);
    expect(again.map((entry) => entry.segments.join('/'))).toEqual(
      entries.map((entry) => entry.segments.join('/')),
    );
  });
});
