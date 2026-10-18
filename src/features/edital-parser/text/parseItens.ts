// Interpretação da tabela de itens do edital (texto de PDF convertido).
//
// Delimitação da tabela (validada contra o edital real):
// - começo: cabeçalho "ITEM UND. CATMAT …" (ausente → varre o texto todo);
// - fim: primeira linha de cláusula numerada ("1.2 …", "2- …") ou marcador
//   "ANEXO …" DEPOIS do primeiro item — assim a tabela repetida em anexo de
//   ata e as cláusulas do Termo de Referência não viram itens.
//
// Rateio por linha: "SDSP - 110 110" (rótulo, quantidade e total na mesma
// linha), "SDSP – 100" + "SPDC- 44 144" (total só na última linha) ou
// "SDSP-12" + "SPDC- 06" + "18" (total em linha só com número, que aparece
// quando o cabeçalho de página é colado no meio da linha). Quantidades no
// padrão brasileiro: ponto é milhar (3.951), vírgula é decimal.
//
// Regra de ouro (docs/handoff/05): a quantidade efetiva vem da SOMA do
// rateio via resolveItemQuantity — nunca da célula isolada.
import { resolveItemQuantity } from '@/shared/lib/quantity';
import type { EditalItem } from '@/shared/types/edital';

const TABLE_HEADER = /ITEM\s+U(?:N\w*)\.?\s+CATMAT/iu;
const ITEM_START = /^(\d{1,3})\s+([A-Za-z][A-Za-z]{0,14}\.?)\s+(\d{4,7})\b/gmu;
const CLAUSE_MARKER =
  /^[ \t]*\d{1,2}(?:[ \t]*[-–—][ \t]*\S|[ \t]*\.\d{1,2}[ \t]+\S|[ \t]*\.[ \t]+[A-ZÀ-Ú])/mu;
const ANEXO_MARKER = /^ANEXO\s+[IVXLC]+\b/mu;
const RATEIO_LINE = /^([A-Z][A-Z0-9]{2,10})[ \t]*[-–—][ \t]*(.*)$/u;
// Rateio colado no fim de uma linha de descrição (ex.: "… 28 mm SDSP-20 20",
// quando a coluna de rateio cai na mesma linha de texto do PDF).
const RATEIO_SUFFIX =
  /\s([A-Z][A-Z0-9]{2,10})[ \t]*[-–—][ \t]*(\d[\d.,]*(?:[ \t]+\d[\d.,]*)*)\s*$/u;
const BARE_NUMBER = /^\d[\d.,]*$/u;
const ITEM_PREFIX = /^\d{1,3}\s+[A-Za-z][A-Za-z]{0,14}\.?\s+\d{4,7}[ \t]*/u;

interface RateioInfo {
  rates: Map<string, number>;
  total: number | undefined;
  excludedLines: Set<number>;
  /** Linhas com o sufixo de rateio removido (rateio colado na descrição). */
  trimmedLines: string[];
}

/** Ponto = milhar (3.951) e vírgula = decimal (0,5), como no edital brasileiro. */
function parsePtNumber(raw: string): number {
  const value = Number(raw.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

function isBlank(line: string | undefined): boolean {
  return (line ?? '').trim() === '';
}

function parseRateio(lines: string[], itemNumber: number, issues: string[]): RateioInfo {
  const rates = new Map<string, number>();
  const totals: number[] = [];
  const excludedLines = new Set<number>();
  const trimmedLines = [...lines];

  const record = (label: string, numbers: string[]): void => {
    if (numbers.length === 0) {
      issues.push(`item ${itemNumber}: linha de rateio "${label}" sem número — ignorada.`);
      return;
    }
    const firstNumber = numbers[0];
    if (firstNumber) {
      rates.set(label, (rates.get(label) ?? 0) + parsePtNumber(firstNumber));
    }
    for (const extra of numbers.slice(1)) totals.push(parsePtNumber(extra));
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = (lines[index] ?? '').trim();
    const labeled = RATEIO_LINE.exec(line);
    if (!labeled) {
      // Rateio colado no fim da linha de descrição: remove só o trecho de
      // rateio e mantém o restante da linha como descrição.
      const suffix = RATEIO_SUFFIX.exec(line);
      if (suffix?.index !== undefined) {
        const label = suffix[1] ?? '';
        const numbers = suffix[2]?.match(/\d[\d.,]*/g) ?? [];
        record(label, numbers);
        trimmedLines[index] = line.slice(0, suffix.index).trimEnd();
      }
      continue;
    }

    const label = labeled[1] ?? '';
    const numbers = labeled[2]?.match(/\d[\d.,]*/g) ?? [];
    excludedLines.add(index);
    record(label, numbers);

    // Totais logo abaixo da linha de rateio (linha só com números),
    // pulando linhas vazias deixadas pela remoção de cabeçalhos.
    let cursor = index + 1;
    while (cursor < lines.length && isBlank(lines[cursor])) cursor += 1;
    while (cursor < lines.length && BARE_NUMBER.test((lines[cursor] ?? '').trim())) {
      excludedLines.add(cursor);
      totals.push(parsePtNumber((lines[cursor] ?? '').trim()));
      cursor += 1;
      while (cursor < lines.length && isBlank(lines[cursor])) cursor += 1;
    }
    index = cursor - 1;
  }

  return { rates, total: totals.at(-1), excludedLines, trimmedLines };
}

function buildItem(
  slice: string,
  itemNumber: number,
  unid: string,
  issues: string[],
): EditalItem {
  const lines = slice.split('\n');
  const { rates, total, excludedLines, trimmedLines } = parseRateio(
    lines,
    itemNumber,
    issues,
  );

  const firstLine = (trimmedLines[0] ?? '').replace(ITEM_PREFIX, '');
  const descriptionParts = trimmedLines
    .map((line, index) => (index === 0 ? firstLine : line))
    .filter((_line, index) => index === 0 || !excludedLines.has(index));
  const descricao = descriptionParts.join(' ').replace(/\s+/g, ' ').trim();
  if (descricao.length === 0) {
    issues.push(`item ${itemNumber}: descrição não lida no texto — confirme a extração.`);
  }

  let qtdSdsp = 0;
  let qtdSpdc = 0;
  let qtdOutras = 0;
  for (const [label, value] of rates) {
    if (label === 'SDSP') qtdSdsp += value;
    else if (label === 'SPDC') qtdSpdc += value;
    else {
      qtdOutras += value;
      issues.push(
        `item ${itemNumber}: rateio da secretaria "${label}" não reconhecido — somado em "outras".`,
      );
    }
  }

  const rateioSum = qtdSdsp + qtdSpdc + qtdOutras;
  if (rateioSum === 0 && total === undefined) {
    issues.push(`item ${itemNumber}: nenhuma quantidade encontrada — confirme a extração.`);
  }

  const item: EditalItem = {
    item: itemNumber,
    // Resolvido logo abaixo pela regra de ouro (shared/lib/quantity).
    qt: rateioSum > 0 ? rateioSum : (total ?? 0),
    qt_celula: total ?? rateioSum,
    unid,
    grupo: '',
    qtd_sdsp: qtdSdsp,
    qtd_spdc: qtdSpdc,
    qtd_outras: qtdOutras,
    divergencia: false,
    descricao,
  };
  const resolved = resolveItemQuantity(item);
  item.qt = resolved.quantity;
  item.divergencia = resolved.divergence;
  return item;
}

/** Lê a tabela de itens do texto já normalizado e sem cabeçalhos de página. */
export function parseItens(text: string, issues: string[]): EditalItem[] {
  const headerIndex = text.search(TABLE_HEADER);
  const matches = Array.from(text.matchAll(ITEM_START), (match) => ({
    index: match.index,
    itemNumber: Number(match[1] ?? 0),
    unid: match[2] ?? '',
  }));
  const afterHeader = matches.filter(
    (match) => headerIndex === -1 || match.index > headerIndex,
  );

  const first = afterHeader[0];
  if (!first) {
    issues.push('nenhuma linha de item encontrada no texto — importe o JSON do edital.');
    return [];
  }

  const firstStart = first.index;
  const clauseAt = text.slice(firstStart).search(CLAUSE_MARKER);
  const anexoAt = text.slice(firstStart).search(ANEXO_MARKER);
  const boundaries = [clauseAt, anexoAt]
    .filter((offset) => offset >= 0)
    .map((offset) => firstStart + offset);
  const tableEnd = boundaries.length > 0 ? Math.min(...boundaries) : text.length;

  const starts = afterHeader.filter((match) => match.index < tableEnd);
  const items: EditalItem[] = [];
  starts.forEach((start, position) => {
    const next = starts[position + 1];
    const sliceEnd = Math.min(next?.index ?? tableEnd, tableEnd);
    const slice = text.slice(start.index, sliceEnd);
    items.push(buildItem(slice, start.itemNumber, start.unid, issues));
  });
  return items;
}
