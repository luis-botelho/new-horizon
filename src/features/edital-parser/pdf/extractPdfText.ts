// Extração de texto de PDF no navegador com pdfjs-dist.
//
// O worker é resolvido via `new URL(..., import.meta.url)` — o webpack (Next)
// transforma isso num asset estático e devolve a URL pública, evitando que o
// pacote tente baixar o worker de uma CDN externa (tudo roda local, ADR 0003).
//
// Usa o build "legacy": ele polyfilla APIs de plataforma (ex.: Uint8Array.toHex)
// e é o mesmo caminho exercitado fora do navegador (Node/vitest).
//
// Tipos mínimos locais: os tipos públicos do pdfjs (v6) não exportam
// TextContent/TextItem e este módulo só precisa de `str`/`hasEOL`.
interface PdfTextItem {
  str?: string;
  hasEOL?: boolean;
}

interface PdfTextContent {
  items: PdfTextItem[];
}

function pageText(content: PdfTextContent): string {
  // `hasEOL` preserva as quebras de linha do PDF: sem elas a tabela de itens
  // inteira vira uma linha só e o parser não acha início de item.
  return content.items
    .map((item) =>
      item.str === undefined
        ? ''
        : item.str + (item.hasEOL ? '\n' : ''),
    )
    .join('');
}

/** Lê todas as páginas e devolve o texto completo (páginas separadas por \n). */
export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const assetBase = (path: string) => new URL(path, import.meta.url).toString();
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = assetBase(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    );
  }
  const task = pdfjs.getDocument({
    data: new Uint8Array(data),
    // Fontes dos PDFs que não embutem fonte (evita aviso do pdf.js).
    standardFontDataUrl: assetBase('pdfjs-dist/standard_fonts/'),
  });
  try {
    const doc = await task.promise;
    let full = '';
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = (await page.getTextContent()) as PdfTextContent;
      full += pageText(content) + '\n';
    }
    return full;
  } finally {
    // Destrói a tarefa (doc + worker), não só o documento.
    await task.destroy();
  }
}
