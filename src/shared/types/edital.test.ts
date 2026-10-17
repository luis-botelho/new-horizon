import { describe, expect, it } from 'vitest';

import { editalParsedSchema } from './edital';
import { SAMPLE_EDITAL } from './__fixtures__/editalSample';

describe('editalParsedSchema', () => {
  it('aceita a fixture sintética válida', () => {
    const parsed = editalParsedSchema.parse(SAMPLE_EDITAL);
    expect(parsed.itens).toHaveLength(4);
    expect(parsed.empresas).toHaveLength(2);
    expect(parsed.itens[2]?.divergencia).toBe(true);
  });

  it('remove chaves desconhecidas (tolera metadados como _sanitizacao)', () => {
    const withExtra = { ...SAMPLE_EDITAL, _sanitizacao: 'nota' } as unknown;
    const parsed = editalParsedSchema.parse(withExtra);
    expect(parsed).not.toHaveProperty('_sanitizacao');
  });

  it('preenche campos opcionais ausentes com os padrões', () => {
    const minimal = structuredClone(SAMPLE_EDITAL) as Record<string, unknown>;
    const edital = minimal['edital'] as Record<string, unknown>;
    delete edital['pncp'];
    delete edital['observacoes'];
    const empresa = (minimal['empresas'] as Record<string, unknown>[])[0];
    delete empresa?.['telefone'];
    delete empresa?.['banco'];

    const parsed = editalParsedSchema.parse(minimal);
    expect(parsed.edital.pncp).toBe('');
    expect(parsed.edital.observacoes).toBe('');
    expect(parsed.empresas[0]?.telefone).toBe('');
    expect(parsed.empresas[0]?.banco).toBe('');
  });

  it('rejeita item duplicado apontando o índice', () => {
    const duplicated = structuredClone(SAMPLE_EDITAL);
    const first = duplicated.itens[0];
    if (first) duplicated.itens[1] = { ...first };

    const result = editalParsedSchema.safeParse(duplicated);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('duplicado'))).toBe(true);
    }
  });

  it('rejeita quantidade não positiva e descrição vazia', () => {
    const broken = structuredClone(SAMPLE_EDITAL);
    const item = broken.itens[0];
    if (item) {
      item.qt = 0;
      item.descricao = '   ';
    }

    const result = editalParsedSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain('quantidade deve ser maior que zero');
      expect(messages).toContain('descrição do item é obrigatória');
    }
  });

  it('rejeita CNPJ com dígito verificador incorreto', () => {
    const broken = structuredClone(SAMPLE_EDITAL);
    const empresa = broken.empresas[0];
    if (empresa) empresa.cnpj = '11.222.333/0001-99';

    const result = editalParsedSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes('dígitos verificadores')),
      ).toBe(true);
    }
  });

  it('rejeita UF com mais de 2 letras e sessão fora do formato ISO', () => {
    const broken = structuredClone(SAMPLE_EDITAL);
    broken.edital.sessao = '16/10/2026 10:00';
    const empresa = broken.empresas[0];
    if (empresa) empresa.uf = 'RIO';

    const result = editalParsedSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toContain('edital.sessao');
      expect(paths).toContain('empresas.0.uf');
    }
  });

  it('exige ao menos uma empresa e ao menos um item', () => {
    expect(editalParsedSchema.safeParse({ ...SAMPLE_EDITAL, empresas: [] }).success).toBe(false);
    expect(editalParsedSchema.safeParse({ ...SAMPLE_EDITAL, itens: [] }).success).toBe(false);
  });
});
