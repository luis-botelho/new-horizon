import { describe, expect, it } from 'vitest';

import {
  buildRootFolderName,
  sanitizeFolderSegment,
  suggestNumeroSegment,
  suggestOrgaoSegment,
  suggestRootFolderName,
  suggestTipoSegment,
} from './folderName';

describe('sanitizeFolderSegment', () => {
  it('remove acentos e usa maiúsculas', () => {
    expect(sanitizeFolderSegment('Câmara dos Deputados')).toBe('CAMARA DOS DEPUTADOS');
  });

  it('remove caracteres ilegais do Windows', () => {
    expect(sanitizeFolderSegment('a<b>c:d"e/f\\g|h?i*j')).toBe('A B C D E F G H I J');
  });

  it('colapsa espaços e corta cauda inválida (ponto/espaço)', () => {
    expect(sanitizeFolderSegment('  CAMA   MESA... ')).toBe('CAMA MESA');
  });

  it('respeita o tamanho máximo do segmento', () => {
    expect(sanitizeFolderSegment('x'.repeat(200))).toHaveLength(80);
  });
});

describe('buildRootFolderName', () => {
  it('sanitiza o número original ("/" não é válido em pasta do Windows)', () => {
    expect(
      buildRootFolderName({
        numero: '552/2026',
        orgao: 'PREFEITURA',
        tipo: 'Cama Mesa',
      }),
    ).toBe('552 2026 - PREFEITURA - CAMA MESA');
  });

  it('monta a raiz sugerida a partir do edital (sem acento, maiúsculo)', () => {
    const name = buildRootFolderName({
      numero: suggestNumeroSegment('552/2026'),
      orgao: suggestOrgaoSegment('Prefeitura Municipal de Angra dos Reis'),
      tipo: 'Cama Mesa',
    });
    expect(name).toBe('5522026 - PREFEITURA - CAMA MESA');
  });

  it('descarta segmentos que viram vazios', () => {
    expect(buildRootFolderName({ numero: '5522026', orgao: '///', tipo: 'Enxoval' })).toBe(
      '5522026 - ENXOVAL',
    );
  });

  it('lança erro quando nada sobra', () => {
    expect(() => buildRootFolderName({ numero: '', orgao: '', tipo: '' })).toThrow(
      'vazio após a sanitização',
    );
  });
});

describe('sugestões', () => {
  it('numero compacto remove tudo que não é dígito', () => {
    expect(suggestNumeroSegment('552/2026')).toBe('5522026');
    expect(suggestNumeroSegment('90.070/2026')).toBe('900702026');
  });

  it('segmento do órgão é a primeira palavra saneada', () => {
    expect(suggestOrgaoSegment('Prefeitura Municipal de Angra dos Reis')).toBe('PREFEITURA');
    expect(suggestOrgaoSegment('Câmara dos Deputados')).toBe('CAMARA');
  });

  it('segmento de tipo usa até 3 palavras do objeto saneadas', () => {
    expect(suggestTipoSegment('Materiais de limpeza e escritório')).toBe('MATERIAIS DE LIMPEZA');
    expect(suggestTipoSegment('Cama, mesa e banho')).toBe('CAMA MESA E');
    expect(suggestTipoSegment('Enxoval')).toBe('ENXOVAL');
    expect(suggestTipoSegment('   ')).toBe('');
  });
});

describe('suggestRootFolderName', () => {
  it('monta a raiz a partir da meta completa (prefere pncp sobre pregão)', () => {
    const name = suggestRootFolderName({
      pregao: '90.070/2026',
      pncp: '00000000000000009000702026',
      orgao: 'Prefeitura Municipal de Angra dos Reis',
      objeto: 'Aquisição de materiais de limpeza',
    });
    expect(name).toBe('00000000000000009000702026 - PREFEITURA - AQUISICAO DE MATERIAIS');
  });

  it('meta parcial do PDF usa o que existe (só pregão)', () => {
    expect(suggestRootFolderName({ pregao: '90.070/2026' })).toBe('900702026');
  });

  it('meta vazia devolve string vazia em vez de lançar', () => {
    expect(suggestRootFolderName({})).toBe('');
  });
});
