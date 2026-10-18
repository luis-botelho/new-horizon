// Limpeza do texto extraído de PDF antes do parser.
// O texto bruto do pdf.js/pypdf traz múltiplos espaços (justificação),
// \u00a0, quebras de linha coladas a cabeçalhos de página e caracteres de
// controle — tudo normalizado aqui, em funções puras e testáveis.

/**
 * Normaliza o texto bruto: fim de linha único, espaços colapsados e
 * caracteres de controle (exceto quebra de linha) removidos.
 */
export function normalizeEditalText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/\p{Cc}/gu, (char) => (char === '\n' ? '\n' : ' '))
    .replace(/[^\S\n]+/gu, ' ')
    .replace(/[ \t]+$/gm, '');
}

/**
 * Remove os cabeçalhos de página que o extrator de PDF costuma colar no meio
 * do conteúdo (ex.: "SDSP - 110 110ESTADO DO RIO DE JANEIRO").
 *
 * Padrões observados em editais do RJ: linha do estado em qualquer caixa e
 * cabeçalho do município em CAIXA ALTA (o nome do município é literal —
 * estender o padrão para outros estados/municípios conforme necessário; a
 * prosa "Município de X" no texto é preservada porque é de onde o órgão é
 * inferido).
 */
export function stripPageHeaders(text: string): string {
  return text
    .replace(/Estado do Rio de Janeiro/gi, '')
    .replace(/MUNICÍPIO DE [A-ZÀ-Ú0-9][A-ZÀ-Ú0-9 .,'’()/-]{1,60}/g, '')
    .replace(/[ ]{2,}/g, ' ');
}
