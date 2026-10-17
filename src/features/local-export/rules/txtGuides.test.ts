import { describe, expect, it } from 'vitest';

import { SAMPLE_EDITAL } from '@/shared/types/__fixtures__/editalSample';

import {
  DOCUMENTOS_NECESSARIOS_FILENAME,
  GUIA_DOCUMENTOS_FILENAME,
  LEIA_ME_FILENAME,
  buildDocumentosNecessariosTxt,
  buildGuiaDocumentosTxt,
  buildLeiaMeTxt,
  buildTextArtifacts,
} from './txtGuides';

const ROOT = '9872026 - PREFEITURA - LIMPEZA';

describe('buildDocumentosNecessariosTxt', () => {
  const txt = buildDocumentosNecessariosTxt(SAMPLE_EDITAL);

  it('traz o cabeçalho do certame a partir do contrato', () => {
    expect(txt).toContain('Pregão: 12.345/2026');
    expect(txt).toContain('Órgão: Prefeitura Municipal de Vila Nova');
    expect(txt).toContain('Sessão: 10/11/2026 às 09:00');
  });

  it('lista as seções A–E com itens marcáveis', () => {
    expect(txt).toContain('(A) HABILITAÇÃO JURÍDICA');
    expect(txt).toContain('(B) HABILITAÇÃO ECONÔMICO-FINANCEIRA');
    expect(txt).toContain('(C) HABILITAÇÃO FISCAL');
    expect(txt).toContain('(D) HABILITAÇÃO SOCIAL E TRABALHISTA');
    expect(txt).toContain('(E) QUALIFICAÇÃO TÉCNICA');
    expect(txt).toContain('- [ ] Contrato Social / Estatuto em vigor');
    expect(txt).toContain('- [ ] CNDT - Certidão Negativa de Débitos Trabalhistas');
    expect(txt).toContain('- [ ] CRF-FGTS (Certificado de Regularidade do FGTS)');
  });

  it('inclui as declarações extras e a regra dos 90 dias', () => {
    expect(txt).toContain('Anexo V - Declaração de Responsabilização');
    expect(txt).toContain('Anexo IX - Indicação da localização');
    expect(txt).toContain('vale a emissão dos últimos 90 dias');
  });

  it('é determinístico (mesma entrada, mesmo conteúdo)', () => {
    expect(buildDocumentosNecessariosTxt(SAMPLE_EDITAL)).toBe(txt);
  });
});

describe('buildGuiaDocumentosTxt', () => {
  const txt = buildGuiaDocumentosTxt(SAMPLE_EDITAL);

  it('explica a validade e o padrão de nome de arquivo', () => {
    expect(txt).toContain('vale 90 dias da emissão');
    expect(txt).toContain('NN - NOME DO DOCUMENTO DD-MM-AAAA.pdf');
    expect(txt).toContain('04 - CND FEDERAL 24-01-2027.pdf');
  });

  it('publica as fórmulas dos índices contábeis', () => {
    expect(txt).toContain('ILG (Liquidez Geral) >= 1');
    expect(txt).toContain('ILC (Liquidez Corrente) >= 1');
    expect(txt).toContain('IE (Endividamento) <= 1');
    expect(txt).toContain('Patrimônio Líquido >= 10% do valor estimado');
  });

  it('traz regras do atestado, prazos do certame, armadilhas e vedações', () => {
    expect(txt).toContain('NÃO vale atestado emitido pela própria licitante');
    expect(txt).toContain('Validade da proposta: 60 dias');
    expect(txt).toContain('Entrega: 15 dias corridos');
    expect(txt).toContain('Garantia: 12 meses');
    expect(txt).toContain('Proposta sem MARCA do item = desclassificação');
    expect(txt).toContain('VEDAÇÕES - CONFIRA ANTES DE PARTICIPAR');
  });
});

describe('buildLeiaMeTxt', () => {
  const txt = buildLeiaMeTxt(SAMPLE_EDITAL, ROOT);

  it('nomeia a raiz e descreve a árvore de pastas', () => {
    expect(txt).toContain(`LEIA-ME - ${ROOT}`);
    expect(txt).toContain('1- EDITAL/');
    expect(txt).toContain('2- COTAÇÃO/');
    expect(txt).toContain('3- DOCUMENTAÇÃO/');
    expect(txt).toContain('4- ANEXOS/');
  });

  it('resume os 10 passos e as regras de ouro', () => {
    expect(txt).toContain('METODOLOGIA (10 PASSOS)');
    expect(txt).toContain('soma do rateio por secretaria');
    expect(txt).toContain('sem marca = desclassificação');
    expect(txt).toContain('UMA POR EMPRESA');
  });

  it('sinaliza os itens com divergência de rateio (singular corretamente)', () => {
    // A fixture tem apenas o item 3 com divergência.
    expect(txt).toContain('ATENÇÃO: 1 com divergência de rateio');
    expect(txt).toContain('itens 3');
    expect(txt).not.toContain('Nenhum item com divergência');
  });

  it('sem divergências, afirma que está tudo certo', () => {
    const clean = structuredClone(SAMPLE_EDITAL);
    for (const item of clean.itens) {
      item.qt = item.qtd_sdsp + item.qtd_spdc + item.qtd_outras;
      item.qt_celula = item.qt;
      item.divergencia = false;
    }
    expect(buildLeiaMeTxt(clean, ROOT)).toContain('Nenhum item com divergência de rateio.');
  });
});

describe('buildTextArtifacts', () => {
  it('gera os três arquivos com os nomes do padrão da empresa', () => {
    const artifacts = buildTextArtifacts(SAMPLE_EDITAL, ROOT);
    expect(artifacts.map((artifact) => artifact.filename)).toEqual([
      DOCUMENTOS_NECESSARIOS_FILENAME,
      GUIA_DOCUMENTOS_FILENAME,
      LEIA_ME_FILENAME,
    ]);
    for (const artifact of artifacts) {
      expect(artifact.content.length).toBeGreaterThan(0);
      expect(artifact.content.endsWith('\n')).toBe(true);
    }
  });
});
