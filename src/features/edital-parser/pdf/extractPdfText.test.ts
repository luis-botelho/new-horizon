import { describe, expect, it } from 'vitest';

import { extractPdfText } from './extractPdfText';
import { MINIMAL_PDF_BASE64 } from './__fixtures__/minimalPdf';

describe('extractPdfText', () => {
  it('extrai o texto das páginas preservando as quebras de linha', async () => {
    const bytes = Uint8Array.from(atob(MINIMAL_PDF_BASE64), (char) =>
      char.charCodeAt(0),
    );
    const text = await extractPdfText(bytes.buffer);

    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    expect(lines).toEqual([
      'ITEM UND. CATMAT',
      '01 Unid. 123456 Peca de teste para validacao',
      'SDSP - 5 5',
      '02 Unid. 234567 Outra peca do edital',
      'SPDC- 3 3',
    ]);
  });
});
