import { describe, expect, it } from 'vitest';

import { editalParsedSchema, proponentCompanySchema } from '@/shared/types/edital';

import { COMPANIES_SEED } from './companiesSeed';

describe('companiesSeed', () => {
  it('deriva a porta de proposta pela posição da empresa', () => {
    expect(COMPANIES_SEED.map((empresa) => [empresa.apelido, empresa.porta])).toEqual([
      ['A.Luz', 'Proposta'],
      ['JLV', 'Readequada JLV'],
    ]);
  });

  it('passa no schema do contrato (chaves extras do seed são removidas)', () => {
    const result = proponentCompanySchema.safeParse(COMPANIES_SEED[0]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.porta).toBe('Proposta');
    expect('porte' in result.data).toBe(false);
    expect('timbre_url' in result.data).toBe(false);
  });

  it('as duas empresas do seed montam um edital mínimo válido', () => {
    const result = editalParsedSchema.safeParse({
      edital: {
        pregao: '90.070/2026',
        orgao: 'Prefeitura Municipal de Angra dos Reis',
        objeto: 'Aquisição de materiais',
        sessao: '2026-10-16T10:00',
        validade_proposta_dias: 90,
        entrega_dias: 20,
        pagamento_dias: 30,
        garantia_meses: 12,
      },
      empresas: COMPANIES_SEED,
      itens: [
        {
          item: 1,
          qt: 110,
          qt_celula: 110,
          unid: 'Unid.',
          descricao: 'Capa protetora',
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
