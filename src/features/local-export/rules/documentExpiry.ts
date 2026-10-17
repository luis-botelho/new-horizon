// Validade de documentos de habilitação a partir do NOME do arquivo
// (docs/handoff/08_ENTIDADES_E_ANEXOS.md):
//   padrão do repositório da empresa: "NN - NOME DO DOCUMENTO DD-MM-AAAA.pdf"
//   (também aparece com pontos: "14 - FGTS 10.11.2026.pdf").
// Sem data no nome → janela de 90 dias a contar da emissão (conforme handoff).

export type ExpiryStatus = 'valid' | 'expiring' | 'expired' | 'unknown';

export interface DocumentExpiry {
  status: ExpiryStatus;
  /** Data de validade encontrada no nome (meia-noite UTC) ou null. */
  expiresOn: Date | null;
  /** Dias restantes (negativo = vencido) ou null quando desconhecido. */
  daysLeft: number | null;
}

/** Padrão de data no nome: DD-MM-AAAA ou DD.MM.AAAA (não confundir com "4- CND"). */
const DATE_IN_FILENAME = /(\d{2})[-.](\d{2})[-.](\d{4})(?!\d)/g;
const MS_PER_DAY = 86_400_000;
/** Aviso de vencimento próximo (dias). */
const WARN_DAYS = 10;

/** Monta Date em UTC a partir de componentes de calendário (sem surpresa de fuso). */
function utcDate(year: number, month: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  // Rejeita datas inválidas (ex.: 31-02-2026) que o Date "engole" rolando o mês.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1) return null;
  if (date.getUTCDate() !== day) return null;
  return date;
}

/**
 * Extrai a ÚLTIMA data válida presente no nome do arquivo.
 * Ex.: "12 - CND CARTORIO DISTRIBUIDORA 04-11-2026.pdf" → 2026-11-04.
 */
export function parseExpiryFromFilename(filename: string): Date | null {
  const matches = [...filename.matchAll(DATE_IN_FILENAME)];
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const match = matches[index];
    if (!match) continue;
    const [, day, month, year] = match;
    if (!day || !month || !year) continue;
    const parsed = utcDate(Number(year), Number(month), Number(day));
    if (parsed) return parsed;
  }
  return null;
}

/**
 * Avalia o vencimento de um documento de habilitação.
 * @param filename nome do arquivo (ex.: "04 - CND FEDERAL 24-01-2027.pdf")
 * @param today data de referência (chamador injeta — função pura/testável)
 * @param warnDays limiar do status 'expiring' (padrão 10 dias)
 */
export function evaluateDocumentExpiry(
  filename: string,
  today: Date,
  warnDays: number = WARN_DAYS,
): DocumentExpiry {
  const expiresOn = parseExpiryFromFilename(filename);
  if (!expiresOn) {
    return { status: 'unknown', expiresOn: null, daysLeft: null };
  }

  // Dia local de "hoje" convertido para calendário UTC (iguala a base da validade).
  const todayUtc = utcDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
  if (!todayUtc) {
    return { status: 'unknown', expiresOn: null, daysLeft: null };
  }

  const daysLeft = Math.round((expiresOn.getTime() - todayUtc.getTime()) / MS_PER_DAY);
  const status: ExpiryStatus = daysLeft < 0 ? 'expired' : daysLeft <= warnDays ? 'expiring' : 'valid';
  return { status, expiresOn, daysLeft };
}
