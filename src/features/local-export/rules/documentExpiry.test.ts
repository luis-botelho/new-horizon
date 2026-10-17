import { describe, expect, it } from 'vitest';

import { evaluateDocumentExpiry, parseExpiryFromFilename } from './documentExpiry';

describe('parseExpiryFromFilename', () => {
  it('extrai data no fim (padrão DD-MM-AAAA)', () => {
    expect(parseExpiryFromFilename('04 - CND FEDERAL 24-01-2027.pdf')).toEqual(
      new Date(Date.UTC(2027, 0, 24)),
    );
  });

  it('aceita separador de ponto (padrão do repositório)', () => {
    expect(parseExpiryFromFilename('14 - FGTS 10.11.2026.pdf')).toEqual(
      new Date(Date.UTC(2026, 10, 10)),
    );
  });

  it('ignora a numeração inicial "NN - " e usa a última data do nome', () => {
    expect(parseExpiryFromFilename('12 - CERTIDOES 01-01-2020 04-11-2026.pdf')).toEqual(
      new Date(Date.UTC(2026, 10, 4)),
    );
  });

  it('devolve null quando não há data ou a data é impossível', () => {
    expect(parseExpiryFromFilename('25 - ÍNDICES DE LIQUIDEZ 2024.pdf')).toBeNull();
    expect(parseExpiryFromFilename('31-02-2026.pdf')).toBeNull();
  });
});

describe('evaluateDocumentExpiry', () => {
  const today = new Date(2026, 9, 17); // 17/10/2026 (componentes locais)

  it('status valid com os dias restantes corretos', () => {
    const result = evaluateDocumentExpiry('04 - CND FEDERAL 24-01-2027.pdf', today);
    expect(result.status).toBe('valid');
    expect(result.daysLeft).toBe(99);
  });

  it('entra em expiring no limiar de 10 dias', () => {
    expect(evaluateDocumentExpiry('14 - FGTS 10.11.2026.pdf', today).daysLeft).toBe(24);
    expect(evaluateDocumentExpiry('14 - FGTS 10.11.2026.pdf', today).status).toBe('valid');
    expect(evaluateDocumentExpiry('14 - FGTS 10.11.2026.pdf', new Date(2026, 10, 5)).status).toBe(
      'expiring',
    );
  });

  it('marca expired quando a data já passou', () => {
    const result = evaluateDocumentExpiry('14 - FGTS 10.11.2026.pdf', new Date(2026, 10, 11));
    expect(result.status).toBe('expired');
    expect(result.daysLeft).toBe(-1);
  });

  it('unknown quando o nome não traz data (regra dos 90 dias fica p/ o guia)', () => {
    const result = evaluateDocumentExpiry('25 - ÍNDICES DE LIQUIDEZ 2024.pdf', today);
    expect(result).toEqual({ status: 'unknown', expiresOn: null, daysLeft: null });
  });

  it('respeita limiar customizado de aviso', () => {
    const result = evaluateDocumentExpiry('14 - FGTS 10.11.2026.pdf', today, 30);
    expect(result.status).toBe('expiring');
  });

  it('não depende do fuso: dias calculados por calendário', () => {
    // Expira no mesmo dia local → 0 dias, ainda em aviso.
    const result = evaluateDocumentExpiry('14 - FGTS 17-10-2026.pdf', today);
    expect(result.daysLeft).toBe(0);
    expect(result.status).toBe('expiring');
  });
});
