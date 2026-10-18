// Extração de texto de PDF no navegador com pdfjs-dist.
//
// Worker e fontes são resolvidos com `new URL(caminho literal, import.meta.url)`
// — o webpack (Next) precisa ver o caminho estático para transformar isso num
// asset e devolver a URL pública; assim nada é baixado de CDN externa (ADR 0003).
// Um wrapper com o caminho como argumento dinâmico quebra essa análise.
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
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
  }
  const task = pdfjs.getDocument({
    data: new Uint8Array(data),
    // `standardFontDataUrl` fica de fora de propósito: é um diretório e o
    // webpack só emite assets de `new URL` com arquivo. Sem ele o pdf.js avisa
    // no console para PDFs com fonte padrão não embutida, mas a extração de
    // texto funciona igual (validada com o PDF real do edital).
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
