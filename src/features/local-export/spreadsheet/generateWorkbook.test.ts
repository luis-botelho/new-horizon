import type ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';

import { SAMPLE_EDITAL } from '@/shared/types/__fixtures__/editalSample';

import { DEFAULT_MARKUP, buildWorkbook, buildWorkbookName } from './generateWorkbook';

/** Extrai a fórmula gravada em uma célula (o valor do exceljs é um objeto). */
function formulaOf(cell: ExcelJS.Cell): string {
  const { value } = cell;
  if (typeof value === 'object' && value !== null && 'formula' in value) {
    return String((value as { formula: string }).formula);
  }
  throw new Error(`célula não é fórmula: ${JSON.stringify(value)}`);
}

describe('buildWorkbookName', () => {
  it('gera nome compacto só com dígitos do pregão', () => {
    expect(buildWorkbookName(SAMPLE_EDITAL)).toBe('123452026.xlsx');
  });
});

describe('buildWorkbook', () => {
  const wb = buildWorkbook(SAMPLE_EDITAL);

  it('cria as abas Cotações, Draft, Empenho e uma por empresa (campo porta)', () => {
    expect(wb.worksheets.map((ws) => ws.name)).toEqual([
      'Cotações',
      'Draft',
      'Empenho',
      'Proposta',
      'Readequada BETA',
    ]);
  });

  describe('aba Cotações', () => {
    const ws = wb.getWorksheet('Cotações');
    if (!ws) throw new Error('aba Cotações ausente');

    it('identifica o certame no título e tem cabeçalho na linha 2', () => {
      expect(String(ws.getCell('A1').value)).toContain('12.345/2026');
      expect(String(ws.getCell('A1').value)).toContain('987/2026');
      expect(ws.getCell('H2').value).toBe('OUTRAS');
      expect(ws.getCell('AJ2').value).toBe('MARKUP %');
    });

    it('usa a soma do rateio como QT (bug real do "3.951") e marca a divergência', () => {
      expect(ws.getCell('B5').value).toBe(3951);
      expect(ws.getCell('F5').value).toBe(400);
      expect(ws.getCell('G5').value).toBe(3551);
      expect(JSON.stringify(ws.getCell('A5').fill)).toContain('FFC7CE');
      expect(JSON.stringify(ws.getCell('A3').fill ?? null)).not.toContain('FFC7CE');
    });

    it('grava as fórmulas de PR TOTAL, MENOR CUSTO, MÍNIMO e TOTAL', () => {
      expect(formulaOf(ws.getCell('N3'))).toBe('IF(M3="","",M3*$B3)');
      expect(formulaOf(ws.getCell('V3'))).toBe('IF(U3="","",U3*$B3)');
      expect(formulaOf(ws.getCell('AD3'))).toBe('IF(AC3="","",AC3*$B3)');
      expect(formulaOf(ws.getCell('AG3'))).toBe('IF(COUNT(M3,U3,AC3)=0,"",MIN(M3,U3,AC3))');
      expect(formulaOf(ws.getCell('AI3'))).toBe('IF($AG3="","",$AG3*$B3)');
      expect(formulaOf(ws.getCell('AK3'))).toBe('IF($AG3="","",ROUND($AG3*(1+$AJ3),2))');
      expect(formulaOf(ws.getCell('AL3'))).toBe('IF($AK3="","",$AK3*$B3)');
    });

    it('aplica o markup padrão em porcentual', () => {
      expect(ws.getCell('AJ3').value).toBe(DEFAULT_MARKUP);
      expect(ws.getCell('AJ3').numFmt).toBe('0.00%');
      expect(DEFAULT_MARKUP).toBe(0.3);
    });

    it('respeita markup customizado', () => {
      const custom = buildWorkbook(SAMPLE_EDITAL, { markup: 0.5 });
      const customWs = custom.getWorksheet('Cotações');
      if (!customWs) throw new Error('aba Cotações ausente');
      expect(customWs.getCell('AJ3').value).toBe(0.5);
    });
  });

  describe('aba Draft', () => {
    const ws = wb.getWorksheet('Draft');
    if (!ws) throw new Error('aba Draft ausente');

    it('puxa descrição e custo da aba Cotações por fórmula', () => {
      expect(formulaOf(ws.getCell('D3'))).toBe("'Cotações'!D3");
      expect(formulaOf(ws.getCell('F3'))).toBe("IF('Cotações'!AG3=\"\",\"\",'Cotações'!AG3)");
      expect(formulaOf(ws.getCell('I3'))).toBe('IF(F3="","",ROUND(F3*(1+$H3),2))');
      expect(ws.getCell('B5').value).toBe(3951);
      expect(ws.getCell('H3').value).toBe(DEFAULT_MARKUP);
    });
  });

  describe('aba Empenho', () => {
    const ws = wb.getWorksheet('Empenho');
    if (!ws) throw new Error('aba Empenho ausente');

    it('puxa o preço final e calcula saldo de entrega', () => {
      expect(formulaOf(ws.getCell('F3'))).toBe("IF('Cotações'!AK3=\"\",\"\",'Cotações'!AK3)");
      expect(formulaOf(ws.getCell('K3'))).toBe('IF(J3="","",$B3-J3)');
      expect(ws.getCell('J2').value).toBe('QTD ENTREGUE');
    });
  });

  describe('aba de proposta', () => {
    const ws = wb.getWorksheet('Proposta');
    if (!ws) throw new Error('aba Proposta ausente');

    it('monta o cabeçalho da empresa com prazos do edital', () => {
      expect(ws.getCell('A1').value).toBe('ALFA COMERCIO DE SUPRIMENTOS LTDA');
      expect(String(ws.getCell('A2').value)).toContain('CNPJ: 11.222.333/0001-81');
      expect(String(ws.getCell('A2').value)).toContain('Inscrição Estadual: 123.456.789');
      const lastLine = String(ws.getCell('A7').value);
      expect(lastLine).toContain('Optante do Simples Nacional');
      expect(lastLine).toContain('Validade da proposta: 60 dias');
      expect(lastLine).toContain('Pagamento: 30 dias');
      expect(lastLine).toContain('Garantia: 12 meses');
    });

    it('lista os itens com preço puxado da Cotações e total geral', () => {
      expect(ws.getCell('A11').value).toBe(1);
      expect(ws.getCell('B11').value).toBe(100);
      expect(ws.getCell('B13').value).toBe(3951);
      expect(formulaOf(ws.getCell('D11'))).toBe("'Cotações'!D3");
      expect(formulaOf(ws.getCell('F11'))).toBe("IF('Cotações'!AK3=\"\",\"\",'Cotações'!AK3)");
      expect(formulaOf(ws.getCell('G11'))).toBe('IF(F11="","",ROUND(F11*$B11,2))');
      expect(ws.getCell('D15').value).toBe('TOTAL GERAL');
      expect(formulaOf(ws.getCell('G15'))).toBe('ROUND(SUM(G11:G14),2)');
      expect(ws.getCell('D15').font?.bold).toBe(true);
    });
  });

  describe('aba da segunda empresa', () => {
    const ws = wb.getWorksheet('Readequada BETA');
    if (!ws) throw new Error('aba Readequada BETA ausente');

    it('omite linhas vazias do cabeçalho (LGPD / campos opcionais)', () => {
      expect(ws.getCell('A1').value).toBe('BETA DISTRIBUIDORA DE UTILIDADES LTDA');
      expect(ws.getCell('A2').value).toBe('CNPJ: 44.555.666/0001-81');
      const lines = ['A3', 'A4', 'A5', 'A6', 'A7', 'A8'].map(
        (address) => String(ws.getCell(address).value ?? ''),
      );
      expect(lines.some((line) => line.startsWith('Email:'))).toBe(false);
      expect(lines.some((line) => line.startsWith('Representante:'))).toBe(false);
      expect(String(ws.getCell('A5').value)).toContain('Optante do Simples Nacional');
    });

    it('reflete a não opção pelo Simples Nacional no parágrafo final', () => {
      const edited = structuredClone(SAMPLE_EDITAL);
      const beta = edited.empresas[1];
      if (!beta) throw new Error('empresa BETA ausente na fixture');
      beta.simples_nacional = false;
      const betaWs = buildWorkbook(edited).getWorksheet('Readequada BETA');
      if (!betaWs) throw new Error('aba Readequada BETA ausente');
      expect(String(betaWs.getCell('A5').value)).toContain('Não optante do Simples Nacional');
    });
  });
});
