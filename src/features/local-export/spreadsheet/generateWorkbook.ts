// Gerador da planilha mestra — port fiel de `pasta exemplo/ferramentas/gerar.py`
// (spec executável) para TypeScript. Layout: aba `Cotações` (3 blocos de
// cotação + menor custo + markup), `Draft`, `Empenho` e uma aba de proposta por
// empresa (nome = campo `porta` da empresa). As fórmulas são gravadas como
// fórmulas do Excel: o usuário digita só os blocos de cotação e o resultado,
// custo e preço mínimo recalculam ao abrir.
//
// Desvios deliberados em relação ao gerar.py:
//  - o rateio tem 3 colunas (SDSP, SPDC, OUTRAS) para cobrir o contrato
//    (qtd_sdsp/qtd_spdc/qtd_outras) — no gerar.py só havia SDSP/SPDC;
//  - quantidade vem de resolveItemQuantity (soma do rateio, regra de ouro);
//  - abas de proposta usam `porta` em vez de "Proposta - {apelido}".
import ExcelJS from 'exceljs';

import type { EditalItem, EditalParsed, ProponentCompany } from '@/shared/types/edital';

import { suggestNumeroSegment } from '../rules/folderName';
import { resolveItemQuantity } from '../rules/quantity';

export const DEFAULT_MARKUP = 0.3;

const COLOR = {
  red: 'FFC7CE',
  gray: 'D9D9D9',
  blue: 'DDEBF7',
  border: 'BFBFBF',
} as const;

const MONEY_FORMAT = '#,##0.00';
const PERCENT_FORMAT = '0.00%';
const INTEGER_FORMAT = '0';

const THIN_BORDER: ExcelJS.Border = {
  style: 'thin',
  color: { argb: COLOR.border },
};

export interface WorkbookOptions {
  /** Markup sobre o custo (0.30 = +30%). Padrão: DEFAULT_MARKUP. */
  markup?: number;
}

interface ColumnSpec {
  name: string;
  width: number;
}

/** Nome da pasta da planilha: só dígitos do pregão/PNCP + ano, ex. "123452026.xlsx". */
export function buildWorkbookName(parsed: EditalParsed): string {
  return `${suggestNumeroSegment(parsed.edital.pregao)}.xlsx`;
}

/** Excel rejeita : \ / ? * [ ] em nomes de aba. */
function sanitizeSheetName(raw: string): string {
  return raw.replace(/[\\/*?:[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 31);
}

function applyBorder(cell: ExcelJS.Cell): void {
  cell.border = {
    top: THIN_BORDER,
    left: THIN_BORDER,
    bottom: THIN_BORDER,
    right: THIN_BORDER,
  };
}

function writeTitle(ws: ExcelJS.Worksheet, text: string): void {
  const cell = ws.getCell('A1');
  cell.value = text;
  cell.font = { bold: true, size: 12 };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.blue } };
}

function writeHeader(ws: ExcelJS.Worksheet, row: number, columns: readonly ColumnSpec[]): void {
  columns.forEach((column, index) => {
    const cell = ws.getCell(row, index + 1);
    cell.value = column.name;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.gray } };
    cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
    applyBorder(cell);
    ws.getColumn(index + 1).width = column.width;
  });
}

/** Aplica borda + formato numérico em uma faixa de colunas da linha. */
function styleDataCells(
  ws: ExcelJS.Worksheet,
  row: number,
  fromColumn: number,
  toColumn: number,
  moneyColumns: ReadonlySet<number>,
  integerColumns: ReadonlySet<number> = new Set(),
): void {
  for (let column = fromColumn; column <= toColumn; column += 1) {
    const cell = ws.getCell(row, column);
    applyBorder(cell);
    if (moneyColumns.has(column)) cell.numFmt = MONEY_FORMAT;
    if (integerColumns.has(column)) cell.numFmt = INTEGER_FORMAT;
  }
}

function setFormula(cell: ExcelJS.Cell, formula: string): void {
  cell.value = { formula };
}

/** Linha de dados da aba Cotações: item resolvido + fórmulas de resultado. */
function writeCotacaoRow(ws: ExcelJS.Worksheet, row: number, item: EditalItem, markup: number): void {
  const { quantity, divergence } = resolveItemQuantity(item);

  ws.getCell(row, 1).value = item.item;
  if (divergence) {
    ws.getCell(row, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.red } };
  }
  ws.getCell(row, 2).value = quantity;
  ws.getCell(row, 3).value = item.unid;
  const description = ws.getCell(row, 4);
  description.value = item.descricao;
  description.alignment = { wrapText: true, vertical: 'top' };
  ws.getCell(row, 5).value = item.grupo;
  ws.getCell(row, 6).value = item.qtd_sdsp;
  ws.getCell(row, 7).value = item.qtd_spdc;
  ws.getCell(row, 8).value = item.qtd_outras;

  // PR TOTAL de cada cotação = PR UNIT × QT.
  for (const base of [9, 17, 25]) {
    const unitLetter = letterOf(base + 4);
    const totalLetter = letterOf(base + 5);
    setFormula(ws.getCell(row, base + 5), `IF(${unitLetter}${row}="","",${unitLetter}${row}*$B${row})`);
  }

  // Resultado: menor custo unitário entre as cotações preenchidas, custo
  // total, markup configurável e preço mínimo/total com ROUND nos centavos.
  setFormula(
    ws.getCell(row, 33),
    `IF(COUNT(M${row},U${row},AC${row})=0,"",MIN(M${row},U${row},AC${row}))`,
  );
  setFormula(ws.getCell(row, 35), `IF($AG${row}="","",$AG${row}*$B${row})`);
  const markupCell = ws.getCell(row, 36);
  markupCell.value = markup;
  markupCell.numFmt = PERCENT_FORMAT;
  setFormula(ws.getCell(row, 37), `IF($AG${row}="","",ROUND($AG${row}*(1+$AJ${row}),2))`);
  setFormula(ws.getCell(row, 38), `IF($AK${row}="","",$AK${row}*$B${row})`);

  styleDataCells(ws, row, 1, 38, new Set([13, 14, 21, 22, 29, 30, 33, 35, 37, 38]), new Set([1, 2, 6, 7, 8]));
}

const COTACAO_COLUMNS: readonly ColumnSpec[] = [
  { name: 'ITEM', width: 6 },
  { name: 'QT', width: 8 },
  { name: 'UNID', width: 7 },
  { name: 'DESCRIÇÃO', width: 60 },
  { name: 'GRUPO', width: 10 },
  { name: 'SDSP', width: 7 },
  { name: 'SPDC', width: 7 },
  { name: 'OUTRAS', width: 8 },
  ...(['C1', 'C2', 'C3'] as const).flatMap((block) => [
    { name: `${block} MARCA`, width: 13 },
    { name: `${block} PRODUTO`, width: 12 },
    { name: `${block} IMPOSTO`, width: 11 },
    { name: `${block} FRETE`, width: 10 },
    { name: `${block} PR UNIT`, width: 12 },
    { name: `${block} PR TOTAL`, width: 13 },
    { name: `${block} CONTATO`, width: 18 },
    { name: `${block} EMPRESA`, width: 16 },
  ]),
  { name: 'MENOR CUSTO UN.', width: 13 },
  { name: 'FORNEC. VENCEDOR', width: 16 },
  { name: 'CUSTO TOTAL', width: 13 },
  { name: 'MARKUP %', width: 9 },
  { name: 'PREÇO MÍNIMO UN.', width: 13 },
  { name: 'PREÇO TOTAL', width: 14 },
];

/** Mapa item → linha na aba Cotações (dados começam na linha 3). */
function buildCotacaoRowMap(items: readonly EditalItem[]): Map<number, number> {
  const map = new Map<number, number>();
  items.forEach((item, index) => map.set(item.item, 3 + index));
  return map;
}

// Coluna A=1 → "A"; Z=26 → "Z"; AA=27 → "AA".
function letterOf(column: number): string {
  let remaining = column;
  let letter = '';
  while (remaining > 0) {
    const remainder = (remaining - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    remaining = Math.floor((remaining - 1) / 26);
  }
  return letter;
}

function addCotacoesSheet(wb: ExcelJS.Workbook, parsed: EditalParsed, markup: number, rowMap: Map<number, number>): void {
  const ws = wb.addWorksheet('Cotações');
  writeTitle(ws, `COTAÇÕES — Pregão ${parsed.edital.pregao} / PNCP ${parsed.edital.pncp}`);
  writeHeader(ws, 2, COTACAO_COLUMNS);
  for (const item of parsed.itens) {
    const row = rowMap.get(item.item);
    if (row !== undefined) writeCotacaoRow(ws, row, item, markup);
  }
  ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 2 }];
}

function addDraftSheet(wb: ExcelJS.Workbook, parsed: EditalParsed, markup: number, rowMap: Map<number, number>): void {
  const ws = wb.addWorksheet('Draft');
  writeTitle(ws, 'DRAFT — CUSTO x MARKUP x PREÇO');
  writeHeader(ws, 2, [
    { name: 'ITEM', width: 6 },
    { name: 'QT', width: 8 },
    { name: 'UNID', width: 7 },
    { name: 'DESCRIÇÃO', width: 60 },
    { name: 'MARCA', width: 14 },
    { name: 'CUSTO UNIT', width: 12 },
    { name: 'CUSTO TOTAL', width: 13 },
    { name: 'MARKUP %', width: 9 },
    { name: 'MÍNIMO UNIT', width: 13 },
    { name: 'MÍNIMO TOTAL', width: 14 },
  ]);

  parsed.itens.forEach((item, index) => {
    const row = 3 + index;
    const cotRow = rowMap.get(item.item);
    if (cotRow === undefined) return;

    ws.getCell(row, 1).value = item.item;
    ws.getCell(row, 2).value = resolveItemQuantity(item).quantity;
    ws.getCell(row, 3).value = item.unid;
    setFormula(ws.getCell(row, 4), `'Cotações'!D${cotRow}`);
    ws.getCell(row, 4).alignment = { wrapText: true, vertical: 'top' };
    setFormula(ws.getCell(row, 5), `IF('Cotações'!AG${cotRow}="","",'Cotações'!AG${cotRow})`);
    setFormula(ws.getCell(row, 6), `IF('Cotações'!AG${cotRow}="","",'Cotações'!AG${cotRow})`);
    setFormula(ws.getCell(row, 7), `IF(F${row}="","",F${row}*$B${row})`);
    const markupCell = ws.getCell(row, 8);
    markupCell.value = markup;
    markupCell.numFmt = PERCENT_FORMAT;
    setFormula(ws.getCell(row, 9), `IF(F${row}="","",ROUND(F${row}*(1+$H${row}),2))`);
    setFormula(ws.getCell(row, 10), `IF(I${row}="","",I${row}*$B${row})`);

    styleDataCells(ws, row, 1, 10, new Set([6, 7, 9, 10]), new Set([1, 2]));
  });
  ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 2 }];
}

function addEmpenhoSheet(wb: ExcelJS.Workbook, parsed: EditalParsed, rowMap: Map<number, number>): void {
  const ws = wb.addWorksheet('Empenho');
  writeTitle(ws, 'EMPENHO / ENTREGA');
  writeHeader(ws, 2, [
    { name: 'ITEM', width: 6 },
    { name: 'QT', width: 8 },
    { name: 'UNID', width: 7 },
    { name: 'DESCRIÇÃO', width: 60 },
    { name: 'MARCA', width: 14 },
    { name: 'PREÇO UNIT', width: 11 },
    { name: 'PREÇO TOTAL', width: 12 },
    { name: 'EMPRESA', width: 16 },
    { name: 'EMPENHO', width: 12 },
    { name: 'QTD ENTREGUE', width: 12 },
    { name: 'SALDO', width: 10 },
    { name: 'DATA ENTREGA', width: 12 },
    { name: 'NF', width: 12 },
    { name: 'OBS', width: 22 },
  ]);

  parsed.itens.forEach((item, index) => {
    const row = 3 + index;
    const cotRow = rowMap.get(item.item);
    if (cotRow === undefined) return;

    ws.getCell(row, 1).value = item.item;
    ws.getCell(row, 2).value = resolveItemQuantity(item).quantity;
    ws.getCell(row, 3).value = item.unid;
    const description = ws.getCell(row, 4);
    description.value = item.descricao;
    description.alignment = { wrapText: true, vertical: 'top' };
    setFormula(ws.getCell(row, 6), `IF('Cotações'!AK${cotRow}="","",'Cotações'!AK${cotRow})`);
    setFormula(ws.getCell(row, 7), `IF(F${row}="","",F${row}*$B${row})`);
    setFormula(ws.getCell(row, 11), `IF(J${row}="","",$B${row}-J${row})`);

    styleDataCells(ws, row, 1, 14, new Set([6, 7]), new Set([1, 2, 10, 11]));
  });
  ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 2 }];
}

/** Linhas de cabeçalho da proposta (cada uma só aparece se tiver conteúdo). */
function companyHeaderLines(company: ProponentCompany, parsed: EditalParsed): string[] {
  const meta = parsed.edital;
  const lines: string[] = [];

  const location = [company.municipio, company.uf].filter((part) => part.length > 0).join(' - ');
  const locationCep = company.cep ? `${location}   CEP: ${company.cep}` : location;
  const contact = [company.email && `Email: ${company.email}`, company.telefone && `Tel: ${company.telefone}`]
    .filter((part): part is string => Boolean(part))
    .join('   ');
  const representative = [
    company.representante && `Representante: ${company.representante}`,
    company.cpf && `CPF: ${company.cpf}`,
    company.rg && `RG: ${company.rg}`,
  ]
    .filter((part): part is string => Boolean(part))
    .join('   ');

  lines.push(company.ie ? `CNPJ: ${company.cnpj}    Inscrição Estadual: ${company.ie}` : `CNPJ: ${company.cnpj}`);
  if (company.endereco) lines.push(company.endereco);
  if (locationCep) lines.push(locationCep);
  if (contact) lines.push(contact);
  if (representative) lines.push(representative);
  if (company.banco) lines.push(`Banco: ${company.banco}`);
  lines.push(
    `${company.simples_nacional ? 'Optante' : 'Não optante'} do Simples Nacional. ` +
      `Validade da proposta: ${meta.validade_proposta_dias} dias. ` +
      `Pagamento: ${meta.pagamento_dias} dias. ` +
      `Garantia: ${meta.garantia_meses} meses.`,
  );
  return lines;
}

function addPropostaSheet(
  wb: ExcelJS.Workbook,
  company: ProponentCompany,
  parsed: EditalParsed,
  rowMap: Map<number, number>,
): void {
  const ws = wb.addWorksheet(sanitizeSheetName(company.porta));
  writeTitle(ws, company.razao_social);

  companyHeaderLines(company, parsed).forEach((line, index) => {
    ws.getCell(index + 2, 1).value = line;
  });

  const headerRow = 10;
  writeHeader(ws, headerRow, [
    { name: 'ITEM', width: 6 },
    { name: 'QUANT', width: 8 },
    { name: 'UNID', width: 7 },
    { name: 'DESCRIÇÃO', width: 60 },
    { name: 'MARCA', width: 16 },
    { name: 'PREÇO ITEM', width: 12 },
    { name: 'PREÇO TOTAL', width: 13 },
  ]);

  const firstDataRow = headerRow + 1;
  parsed.itens.forEach((item, index) => {
    const row = firstDataRow + index;
    const cotRow = rowMap.get(item.item);
    if (cotRow === undefined) return;

    ws.getCell(row, 1).value = item.item;
    ws.getCell(row, 2).value = resolveItemQuantity(item).quantity;
    ws.getCell(row, 3).value = item.unid;
    setFormula(ws.getCell(row, 4), `'Cotações'!D${cotRow}`);
    ws.getCell(row, 4).alignment = { wrapText: true, vertical: 'top' };
    setFormula(ws.getCell(row, 6), `IF('Cotações'!AK${cotRow}="","",'Cotações'!AK${cotRow})`);
    setFormula(ws.getCell(row, 7), `IF(F${row}="","",ROUND(F${row}*$B${row},2))`);

    styleDataCells(ws, row, 1, 7, new Set([6, 7]), new Set([1, 2]));
  });

  const totalRow = firstDataRow + parsed.itens.length;
  const totalLabel = ws.getCell(totalRow, 4);
  totalLabel.value = 'TOTAL GERAL';
  totalLabel.font = { bold: true };
  const totalValue = ws.getCell(totalRow, 7);
  setFormula(totalValue, `ROUND(SUM(G${firstDataRow}:G${totalRow - 1}),2)`);
  totalValue.font = { bold: true };
  totalValue.numFmt = MONEY_FORMAT;

  ws.views = [{ state: 'frozen', ySplit: headerRow }];
}

/**
 * Monta a planilha mestra completa em memória. O chamador grava o buffer
 * (no navegador via File System Access ou ZIP).
 */
export function buildWorkbook(parsed: EditalParsed, options: WorkbookOptions = {}): ExcelJS.Workbook {
  const markup = options.markup ?? DEFAULT_MARKUP;
  const wb = new ExcelJS.Workbook();
  const rowMap = buildCotacaoRowMap(parsed.itens);

  addCotacoesSheet(wb, parsed, markup, rowMap);
  addDraftSheet(wb, parsed, markup, rowMap);
  addEmpenhoSheet(wb, parsed, rowMap);
  for (const company of parsed.empresas) {
    addPropostaSheet(wb, company, parsed, rowMap);
  }

  return wb;
}
