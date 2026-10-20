import { describe, expect, it } from 'vitest';

import { HABILITACAO_SECTIONS } from './documentCatalog';
import { auditHabilitacao, type AuditedEntry, type FolderAudit } from './audit';

/** Data fixa para testes: 19/10/2026 (mesa dos exemplos de validade). */
const TODAY = new Date('2026-10-19T12:00:00');

/**
 * Nomes sintéticos no formato real da árvore da empresa
 * ("pasta exemplo/3- DOCUMENTAÇÃO/" — gitignorada por LGPD), incluindo
 * caixa alta sem acento, data com ponto e subpasta de atestado.
 */
const DOCUMENTACAO = [
  '1 - CONTRATO SOCIAL.pdf',
  '2 - CNPJ.pdf',
  '3 - INSCRICAO ESTADUAL.pdf',
  '4- CND FEDERAL 24-01-2027.pdf',
  '5-CERTIDAO NEGATIVA DE DEBITOS ESTADUAL  28.10.2026.pdf',
  '6 - CERTIDAO NEGATIVA ESTADUAL DIVIDA ATIVA 31-10-2026.pdf',
  '7 - CERTIDAO NEGATIVA MUNICIPAIL IPTU, ISS 21.10.2026.pdf',
  '10 - CERTIDAO NEGATIVA DE DEBITOS TRABALHISTAS 01-10-2026.pdf',
  '11 - CERTIDAO NEGATIVA FALENCIA E CONCORDATA  25.10.2026.pdf',
  '14 - FGTS  10.11.2026.pdf',
  '19 - BALANCO PATRIMONIAL 2025.pdf',
  '20 - INDICES DE LIQUIDEZ 2025.pdf',
  '22 - Termo de abertura e encerramento 2025.pdf',
  '2025 atualizado CONTÁBIL_.pdf',
  'Atestado tec/atestado_capacidade.pdf',
  '.contrato social.tmp',
  'desktop.ini',
];

const CATALOG_TOTAL = HABILITACAO_SECTIONS.reduce(
  (count, section) => count + section.entries.length,
  0,
);

function entryOf(audit: FolderAudit, code: string, textPrefix: string): AuditedEntry {
  const section = audit.sections.find((candidate) => candidate.code === code);
  const entry = section?.entries.find((candidate) => candidate.text.startsWith(textPrefix));
  if (!entry) throw new Error(`entrada não encontrada: (${code}) ${textPrefix}`);
  return entry;
}

describe('auditHabilitacao', () => {
  const audit = auditHabilitacao(DOCUMENTACAO, TODAY);

  it('cobre o catálogo inteiro (A–E) e fecha os totais', () => {
    expect(audit.total).toBe(CATALOG_TOTAL);
    expect(audit.total).toBe(20);
    expect(audit.found + audit.missing).toBe(audit.total);
    expect(audit.found).toBe(13);
    expect(audit.missing).toBe(7);
  });

  it('casa nomes em caixa alta e sem acento com as keywords do catálogo', () => {
    const inscricao = entryOf(audit, 'C', 'Inscrição estadual');
    expect(inscricao.status).toBe('found');
    expect(inscricao.files.map((file) => file.path)).toContain('3 - INSCRICAO ESTADUAL.pdf');

    const cndt = entryOf(audit, 'D', 'CNDT');
    expect(cndt.status).toBe('found');

    const fgts = entryOf(audit, 'C', 'CRF-FGTS');
    expect(fgts.status).toBe('found');
    expect(fgts.files).toHaveLength(1);
  });

  it('casa arquivos dentro de subpastas (atestado)', () => {
    const atestado = entryOf(audit, 'E', 'Atestado(s)');
    expect(atestado.status).toBe('found');
    expect(atestado.files[0]?.path).toBe('Atestado tec/atestado_capacidade.pdf');
  });

  it('sinaliza como faltante o que não apareceu na pasta', () => {
    const registro = entryOf(audit, 'A', 'Registro comercial');
    expect(registro.status).toBe('missing');
    expect(registro.files).toHaveLength(0);

    expect(entryOf(audit, 'B', 'Alternativa aos índices').status).toBe('missing');
    expect(entryOf(audit, 'D', 'Anexo VIII').status).toBe('missing');
  });

  it('classifica a validade a partir da data no nome do arquivo', () => {
    const cndFederal = entryOf(audit, 'C', 'Certidão Conjunta');
    expect(cndFederal.files[0]?.expiry.status).toBe('valid');
    expect(cndFederal.files[0]?.expiry.daysLeft).toBe(97);

    const cndt = entryOf(audit, 'D', 'CNDT');
    expect(cndt.files[0]?.expiry.status).toBe('expired');
    expect(cndt.files[0]?.expiry.daysLeft).toBe(-18);

    // Dois arquivos casados: o vencendo vem antes do válido.
    const debitosEstaduais = entryOf(audit, 'C', 'Certidão estadual (ICMS)');
    expect(debitosEstaduais.files.map((file) => file.expiry.status)).toEqual([
      'expiring',
      'valid',
    ]);

    expect(audit.expired).toBe(1);
    expect(audit.expiring).toBe(3);
  });

  it('ignora arquivos ocultos e lixo de sistema', () => {
    const solo = auditHabilitacao(['.contrato social.tmp', 'desktop.ini'], TODAY);
    expect(solo.found).toBe(0);
    expect(entryOf(solo, 'A', 'Contrato Social').status).toBe('missing');
  });

  it('é determinístico (mesma entrada, mesmo resultado)', () => {
    expect(auditHabilitacao(DOCUMENTACAO, TODAY)).toEqual(audit);
  });
});
