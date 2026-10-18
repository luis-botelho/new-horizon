import { describe, expect, it } from 'vitest';

import type { EditalItem } from '@/shared/types/edital';

import { EDITAL_TEXT_SAMPLE } from './__fixtures__/editalTextSample';
import { parseEditalText } from './parseEditalText';

const result = parseEditalText(EDITAL_TEXT_SAMPLE);

function item(itemNumber: number): EditalItem {
  const found = result.itens.find((current) => current.item === itemNumber);
  if (!found) throw new Error(`resultado sem o item ${itemNumber}`);
  return found;
}

describe('parseEditalText — edital real (excerto público do PNCP)', () => {
  describe('meta', () => {
    it('extrai a identificação do certame', () => {
      expect(result.meta.pregao).toBe('90.070/2026');
      expect(result.meta.pncp).toBe('552/2026');
      expect(result.meta.uasg).toBe('985801');
      expect(result.meta.processo_sei).toBe('SEI-2025-06001343');
    });

    it('infere órgão a partir da prosa e extrai o objeto', () => {
      expect(result.meta.orgao).toBe('Prefeitura Municipal de Angra dos Reis');
      expect(result.meta.objeto).toBe('AQUISIÇÃO DE MATERIAIS DE CAMA, MESA E BANHO');
    });

    it('extrai a data e a hora da sessão', () => {
      expect(result.meta.sessao).toBe('2026-10-16T10:00');
    });

    it('para escolhas usa a primeira ocorrência', () => {
      expect(result.meta.criterio).toBe('MENOR PREÇO POR ITEM');
      expect(result.meta.modo).toBe('ABERTO');
      expect(result.meta.orcamento).toBe('SIGILOSO');
      expect(result.meta.plataforma).toBe('gov.br / ComprasGov');
    });

    it('para números de prazo usa o último valor distinto e avisa do conflito', () => {
      // Cláusula 6.5 manda guardar a proposta 60 dias; o Termo de Referência
      // (5.3) manda 90 — a empresa opera com 90 e o parser sinaliza.
      expect(result.meta.validade_proposta_dias).toBe(90);
      expect(
        result.issues.some(
          (issue) => issue.includes('validade') && issue.includes('60, 90'),
        ),
      ).toBe(true);
      expect(result.meta.entrega_dias).toBe(20);
      expect(result.meta.pagamento_dias).toBe(30);
      expect(result.meta.garantia_meses).toBe(12);
    });

    it('não deixa obrigatório faltando e não inventa problema em opcionais', () => {
      expect(result.issues.filter((issue) => issue.includes('não encontrado'))).toEqual([]);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toContain('validade');
    });
  });

  describe('itens', () => {
    it('encontra os 35 itens em ordem', () => {
      expect(result.itens).toHaveLength(35);
      expect(result.itens.map((current) => current.item)).toEqual(
        Array.from({ length: 35 }, (_unused, index) => index + 1),
      );
    });

    it('item 1: rateio simples e descrição sem resíduo de rateio', () => {
      const first = item(1);
      expect(first.unid).toBe('Unid.');
      expect(first.qtd_sdsp).toBe(110);
      expect(first.qtd_spdc).toBe(0);
      expect(first.qt).toBe(110);
      expect(first.qt_celula).toBe(110);
      expect(first.divergencia).toBe(false);
      expect(first.descricao.startsWith('Capa protetora impermeável')).toBe(true);
      expect(first.descricao).not.toContain('SDSP');
    });

    it('item 5: rateio em duas linhas (total só na última)', () => {
      const fifth = item(5);
      expect(fifth.qtd_sdsp).toBe(100);
      expect(fifth.qtd_spdc).toBe(44);
      expect(fifth.qt).toBe(144);
      expect(fifth.qt_celula).toBe(144);
      expect(fifth.divergencia).toBe(false);
    });

    it('item 12: ponto no total é separador de milhar (400 + 3.551 = 3.951)', () => {
      const twelfth = item(12);
      expect(twelfth.qtd_sdsp).toBe(400);
      expect(twelfth.qtd_spdc).toBe(3551);
      expect(twelfth.qt).toBe(3951);
      expect(twelfth.qt_celula).toBe(3951);
      // Do PDF não há divergência real: a célula "3.951" é milhar e bate com
      // a soma. O JSON de referência (gerado do XLSX) traz divergencia=true
      // porque ali a célula foi lida como decimal 3.951 — bug da origem.
      expect(twelfth.divergencia).toBe(false);
    });

    it('item 13: rateio só da SDSP', () => {
      const thirteenth = item(13);
      expect(thirteenth.qtd_sdsp).toBe(100);
      expect(thirteenth.qtd_spdc).toBe(0);
      expect(thirteenth.qt).toBe(100);
      expect(thirteenth.divergencia).toBe(false);
    });

    it('item 28: rateio colado sem espaço após o traço', () => {
      const twentyEighth = item(28);
      expect(twentyEighth.qtd_sdsp).toBe(8);
      expect(twentyEighth.qt).toBe(8);
    });

    it('item 33: rateio colado no fim da linha de descrição', () => {
      // O PDF joga a coluna de rateio na mesma linha do texto: "… 28 mm
      // SDSP-20 20ESTADO…" — o cabeçalho sai e o rateio precisa sair da
      // descrição sem perder o texto antes dele.
      const thirtyThird = item(33);
      expect(thirtyThird.qtd_sdsp).toBe(20);
      expect(thirtyThird.qt).toBe(20);
      expect(thirtyThird.descricao).toContain('Kit Varão de ferro/pvc 28 mm');
      expect(thirtyThird.descricao).not.toContain('SDSP');
    });

    it('item 29: rateio no meio da descrição com total em linha própria', () => {
      // A tabela quebra página no item 29: o total "18" fica numa linha que
      // vinha colada ao cabeçalho "ESTADO DO RIO DE JANEIRO".
      const twentyNinth = item(29);
      expect(twentyNinth.qtd_sdsp).toBe(12);
      expect(twentyNinth.qtd_spdc).toBe(6);
      expect(twentyNinth.qt).toBe(18);
      expect(twentyNinth.qt_celula).toBe(18);
      expect(twentyNinth.descricao).toContain('Cortina');
      expect(twentyNinth.descricao).not.toContain('SPDC');
      expect(twentyNinth.descricao).not.toContain('ESTADO');
      expect(twentyNinth.descricao).not.toContain('MUNICÍPIO');
    });

    it('item 35: a descrição para na primeira cláusula do Termo de Referência', () => {
      const last = item(35);
      expect(last.qt).toBeGreaterThan(0);
      expect(last.descricao).not.toContain('CRITÉRIO');
      expect(last.descricao).not.toContain('CATSER');
      expect(last.descricao).not.toContain('1.2 Em caso');
    });

    it('todos os itens têm quantidade e descrição plausíveis', () => {
      for (const current of result.itens) {
        expect(current.qt).toBeGreaterThan(0);
        expect(current.descricao.length).toBeGreaterThan(10);
        expect(current.descricao).not.toContain('ESTADO DO RIO');
        expect(current.descricao).not.toContain('MODO DE DISPUTA');
        expect(current.grupo).toBe('');
      }
    });

    it('só reconhece as secretarias do edital (SDSP/SPDC)', () => {
      expect(result.issues.filter((issue) => issue.includes('não reconhecido'))).toEqual([]);
    });
  });
});

describe('parseEditalText — delimitação de tabela', () => {
  it('para na primeira cláusula e ignora a tabela repetida do anexo', () => {
    const synthetic = [
      'PREGÃO ELETRÔNICO PARA REGISTRO DE PREÇOS Nº 1.234/2026',
      'ITEM UND. CATMAT DESCRIÇÃO QUANT. PORSECRETARIA QUANT.TOTAL',
      '01 Unid. 123456 Peça A',
      'SDSP - 10 10',
      '02 Unid. 234567 Peça B',
      'SDSP - 5 5',
      '1 – DO OBJETO',
      '2 – DA JUSTIFICATIVA',
      '30 Unid. 623467 Peça repetida na ata',
      'ANEXO III',
      '31 Unid. 623467 Outra peça fora da tabela',
    ].join('\n');
    const parsed = parseEditalText(synthetic);
    expect(parsed.itens.map((current) => current.item)).toEqual([1, 2]);
  });

  it('para também num ANEXO II sem cláusula numerada antes', () => {
    const synthetic = [
      'ITEM UND. CATMAT DESCRIÇÃO QUANT. PORSECRETARIA QUANT.TOTAL',
      '01 Unid. 123456 Peça A',
      'SDSP - 10 10',
      '02 Unid. 234567 Peça B',
      'SPDC- 5 5',
      'ANEXO II - MODELO DE PROPOSTA DE PREÇOS',
      '03 Unid. 999999 Não deve entrar',
    ].join('\n');
    const parsed = parseEditalText(synthetic);
    expect(parsed.itens.map((current) => current.item)).toEqual([1, 2]);
  });

  it('varre o texto todo quando o cabeçalho da tabela não aparece', () => {
    const synthetic = ['01 Unid. 123456 Peça A', 'SDSP - 3 3'].join('\n');
    const parsed = parseEditalText(synthetic);
    expect(parsed.itens).toHaveLength(1);
    expect(parsed.itens[0]?.qt).toBe(3);
  });
});

describe('parseEditalText — entrada mínima', () => {
  it('sinaliza campo obrigatório ausente quando só há a tabela', () => {
    const synthetic = [
      'ITEM UND. CATMAT DESCRIÇÃO QUANT. PORSECRETARIA QUANT.TOTAL',
      '01 Unid. 123456 Peça A',
      'SDSP - 2 2',
    ].join('\n');
    const parsed = parseEditalText(synthetic);
    expect(parsed.meta.sessao).toBeUndefined();
    expect(parsed.issues.some((issue) => issue.includes('sessão'))).toBe(true);
    expect(parsed.issues.some((issue) => issue.includes('pregão'))).toBe(true);
    expect(parsed.issues.some((issue) => issue.includes('órgão'))).toBe(true);
    expect(parsed.itens).toHaveLength(1);
  });

  it('texto vazio devolve lista vazia e avisa', () => {
    const parsed = parseEditalText('');
    expect(parsed.itens).toEqual([]);
    expect(parsed.issues.some((issue) => issue.includes('nenhuma linha de item'))).toBe(true);
  });
});
