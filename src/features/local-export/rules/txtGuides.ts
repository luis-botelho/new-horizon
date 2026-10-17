// Geradores dos arquivos de texto da árvore de pastas
// (docs/handoff/04_ESTRUTURA_PASTAS.md):
//   3- DOCUMENTAÇÃO/00 - DOCUMENTOS NECESSÁRIOS.txt
//   3- DOCUMENTAÇÃO/00 - GUIA DOS DOCUMENTOS.txt
//   LEIA-ME.txt
// Conteúdo baseado no catálogo real da empresa (08_ENTIDADES_E_ANEXOS.md e
// checklist de habilitação). Em caso de divergência, vale o edital do certame.
import type { EditalParsed } from '@/shared/types/edital';

import { resolveItemQuantity } from './quantity';

export const DOCUMENTOS_NECESSARIOS_FILENAME = '00 - DOCUMENTOS NECESSÁRIOS.txt';
export const GUIA_DOCUMENTOS_FILENAME = '00 - GUIA DOS DOCUMENTOS.txt';
export const LEIA_ME_FILENAME = 'LEIA-ME.txt';

export interface TextArtifact {
  filename: string;
  content: string;
}

interface DocumentSection {
  code: string;
  title: string;
  entries: string[];
}

/** Catálogo de habilitação (seções A–E), fiel ao checklist da empresa. */
const HABILITACAO_SECTIONS: DocumentSection[] = [
  {
    code: 'A',
    title: 'HABILITAÇÃO JURÍDICA',
    entries: [
      'Registro comercial (se empresário individual)',
      'Contrato Social / Estatuto em vigor, registrado, com chancela digital',
      'Documentos de designação dos administradores (se em ato separado)',
      'Alterações consolidadas com todas as cláusulas em vigor (se houver)',
    ],
  },
  {
    code: 'B',
    title: 'HABILITAÇÃO ECONÔMICO-FINANCEIRA',
    entries: [
      'Balanço patrimonial e demonstrações dos 2 últimos exercícios, registrados na Junta Comercial',
      'Termos de abertura e encerramento do Livro Diário',
      'Índices calculados e demonstrados: ILG >= 1, ILC >= 1, IE <= 1 (fórmulas no guia)',
      'Alternativa aos índices: Patrimônio Líquido >= 10% do valor estimado da contratação',
      'Certidões negativas de falência e recuperação judicial/extrajudicial',
      'Anexo VII - Declaração de integralidade dos custos trabalhistas',
    ],
  },
  {
    code: 'C',
    title: 'HABILITAÇÃO FISCAL',
    entries: [
      'CNPJ com quadro societário atualizado',
      'Inscrição estadual ou municipal pertinente ao objeto (quando exigida)',
      'Certidão Conjunta Negativa de Débitos Federais (Receita Federal + PGFN)',
      'Certidão estadual (ICMS) + Certidão da Dívida Ativa Estadual',
      'Certidão municipal (ISS) + Dívida Ativa Municipal (e IPTU, se a sede for no município)',
      'CRF-FGTS (Certificado de Regularidade do FGTS)',
    ],
  },
  {
    code: 'D',
    title: 'HABILITAÇÃO SOCIAL E TRABALHISTA',
    entries: [
      'Declaração de não emprego de menor (item D.1 do edital)',
      'CNDT - Certidão Negativa de Débitos Trabalhistas (ou positiva com efeito negativo)',
      'Anexo VIII - Declaração de reserva de cargos para PCD/reabilitado',
    ],
  },
  {
    code: 'E',
    title: 'QUALIFICAÇÃO TÉCNICA',
    entries: [
      'Atestado(s) de capacidade técnica compatível com o objeto, emitido por terceiro (não vale o da própria licitante)',
    ],
  },
];

/** Declarações complementares exigidas como anexo ou campo do sistema. */
const DECLARACOES_EXTRAS: string[] = [
  'Proposta de Preços (Anexo II) - com MARCA de cada item',
  'Declaração dos itens ofertados (item 12.1.2)',
  'Declaração de ausência de vínculo com servidores do Município (item 7.11)',
  'Anexo V - Declaração de Responsabilização Civil e Administrativa (Lei 12.846/2013)',
  'Anexo VI - Declaração de Inexistência de Nepotismo',
  'Anexo VII - Declaração para fins de habilitação (art. 63, I e §1º, Lei 14.133/2021)',
  'Anexo VIII - Declaração de cumprimento de reserva de cargos (art. 63, IV)',
  'Anexo IX - Indicação da localização das instalações + cópia do Alvará de Funcionamento',
  'Campos próprios do sistema: inexistência de fato impeditivo, conhecimento do regulamento e responsabilidade pela origem (item 7.3)',
];

/** "2026-11-10T09:00" → "10/11/2026 às 09:00". */
function formatSession(iso: string): string {
  const [datePart, timePart] = iso.split('T');
  if (!datePart) return iso;
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return iso;
  const clock = timePart ? ` às ${timePart.slice(0, 5)}` : '';
  return `${day}/${month}/${year}${clock}`;
}

/** Cabeçalho de identificação usado nos três arquivos. */
function certameHeader(parsed: EditalParsed): string[] {
  const meta = parsed.edital;
  return [
    `Pregão: ${meta.pregao}${meta.pncp ? ` · PNCP ${meta.pncp}` : ''}`,
    `Órgão: ${meta.orgao}`,
    `Objeto: ${meta.objeto}`,
    `Sessão: ${formatSession(meta.sessao)} · ${meta.plataforma || 'plataforma a confirmar no edital'}`,
    `Critério: ${meta.criterio || 'conforme edital'} · Modo: ${meta.modo || 'conforme edital'}`,
    '',
  ];
}

/** Lista de itens marcáveis ("checkbox" em TXT puro). */
export function buildDocumentosNecessariosTxt(parsed: EditalParsed): string {
  const lines: string[] = [
    'DOCUMENTOS NECESSÁRIOS - HABILITAÇÃO',
    '='.repeat(60),
    '',
    ...certameHeader(parsed),
    'Marque cada documento conforme reunir. Sem prazo de validade no documento,',
    'vale a emissão dos últimos 90 dias. Confira sempre o edital: em caso de',
    'divergência, vale o edital original.',
    '',
  ];

  for (const section of HABILITACAO_SECTIONS) {
    lines.push(`(${section.code}) ${section.title}`);
    for (const entry of section.entries) {
      lines.push(`- [ ] ${entry}`);
    }
    lines.push('');
  }

  lines.push('DECLARAÇÕES EXTRAS (ANEXOS E CAMPOS DO SISTEMA)');
  for (const entry of DECLARACOES_EXTRAS) {
    lines.push(`- [ ] ${entry}`);
  }
  lines.push('');

  return `${lines.join('\n')}\n`;
}

/** Guia explicativo: o que é cada documento, pontos de atenção e armadilhas. */
export function buildGuiaDocumentosTxt(parsed: EditalParsed): string {
  const meta = parsed.edital;
  const lines: string[] = [
    'GUIA DOS DOCUMENTOS - COMO MONTAR A HABILITAÇÃO',
    '='.repeat(60),
    '',
    ...certameHeader(parsed),
    '1) VALIDADE',
    '   - Documento sem prazo no nome vale 90 dias da emissão (item 12 do edital).',
    '   - Nomeie os arquivos como: NN - NOME DO DOCUMENTO DD-MM-AAAA.pdf',
    '     Ex.: "04 - CND FEDERAL 24-01-2027.pdf" - assim o app detecta o vencimento.',
    '',
    '2) ÍNDICES CONTÁBEIS (seção B do checklist)',
    '   - ILG (Liquidez Geral) >= 1  = (Ativo Circulante + Realizável LP) / (Passivo Circulante + Passivo Não Circulante)',
    '   - ILC (Liquidez Corrente) >= 1 = Ativo Circulante / Passivo Circulante',
    '   - IE (Endividamento) <= 1     = (Passivo Circulante + Passivo Não Circulante) / Patrimônio Líquido',
    '   - Se algum índice não for atingido: comprovar Patrimônio Líquido >= 10% do valor estimado.',
    '',
    '3) ATESTADO DE CAPACIDADE TÉCNICA (seção E)',
    '   - Deve conter: emitente, responsável pela emissão, licitante, descrição dos produtos e prazo.',
    '   - NÃO vale atestado emitido pela própria licitante.',
    '',
    '4) PRAZOS DESTE CERTAME',
    `   - Validade da proposta: ${meta.validade_proposta_dias} dias`,
    `   - Entrega: ${meta.entrega_dias} dias corridos (transporte/carga/descarga por conta da contratada)`,
    `   - Pagamento: ${meta.pagamento_dias} dias após liquidação`,
    `   - Garantia: ${meta.garantia_meses} meses`,
    '',
    '5) ORDEM SUGERIDA DO ZIP DE HABILITAÇÃO',
    '   Monte um arquivo único compactado na ordem das seções:',
    '   A (jurídica) -> B (econômica) -> C (fiscal) -> D (social) -> E (técnica) -> declarações.',
    '   Nomeie: "01 - Contrato Social.pdf", "02 - CND Federal.pdf", ...',
    '',
    '6) ARMADILHAS FREQUENTES',
    '   - Proposta sem MARCA do item = desclassificação.',
    '   - Preço acima do orçamento sigiloso ou inexequível = desclassificação.',
    '   - Certidão vencida ou emitida há mais de 90 dias (quando sem prazo).',
    '   - Balanço sem registro na Junta Comercial / sem termos do Livro Diário.',
    '   - Documentos soltos quando o sistema pede arquivo único compactado.',
    '',
    '7) VEDAÇÕES - CONFIRA ANTES DE PARTICIPAR',
    '   - Empresa suspensa/inidônea ou sócio majoritário apenado.',
    '   - Dirigentes/sócios que sejam ou foram servidores nos últimos 180 dias.',
    '   - Participação na elaboração do Termo de Referência.',
    '   - Vínculo com dirigente do órgão ou agente da licitação (ou parentes até 3º grau).',
    '   - Controladoras/controladas/coligadas concorrendo entre si.',
    '',
    '* Baseado no catálogo de documentos da empresa. Em caso de divergência, vale o edital.',
    '',
  ];

  return `${lines.join('\n')}\n`;
}

/** LEIA-ME da pasta: árvore, metodologia e regras de ouro. */
export function buildLeiaMeTxt(parsed: EditalParsed, rootFolderName: string): string {
  const divergingItems = parsed.itens
    .filter((item) => resolveItemQuantity(item).divergence)
    .map((item) => item.item);
  const itemCountLabel = parsed.itens.length === 1 ? 'item' : 'itens';
  const divergenceLine =
    divergingItems.length === 0
      ? 'Nenhum item com divergência de rateio.'
      : `ATENÇÃO: ${divergingItems.length} com divergência de rateio (confira a quantidade na planilha): itens ${divergingItems.join(', ')}.`;

  const lines: string[] = [
    `LEIA-ME - ${rootFolderName}`,
    '='.repeat(60),
    '',
    ...certameHeader(parsed),
    `Conteúdo: ${parsed.itens.length} ${itemCountLabel}. ${divergenceLine}`,
    '',
    'ESTRUTURA DA PASTA',
    '  1- EDITAL/            PDF do edital assinado e ata (quando houver).',
    '  2- COTAÇÃO/           Planilha mestre (.xlsx) e subpastas COTAÇÃO 1..N',
    '                         com os orçamentos recebidos (PDF/JPG).',
    '  3- DOCUMENTAÇÃO/      Habilitação: certidões e documentos.',
    '    00 - DOCUMENTOS NECESSÁRIOS.txt   checklist para marcar.',
    '    00 - GUIA DOS DOCUMENTOS.txt       o que é cada documento + armadilhas.',
    '    4- ANEXOS/           Anexos em .docx prontos para assinar.',
    '  LEIA-ME.txt           este arquivo.',
    '',
    'METODOLOGIA (10 PASSOS)',
    '  1. Baixar o edital assinado do ComprasGov/PNCP para 1- EDITAL/.',
    '  2. Conferir os itens na planilha mestre (2- COTAÇÃO) - já saem preenchidos.',
    '  3. Disparar pedidos de cotação aos fornecedores (por categoria).',
    '  4. Receber orçamentos e salvar em COTAÇÃO 1..N/.',
    '  5. Digitar cada cotação na aba "Cotações" (marca, produto, imposto, frete, preço).',
    '  6. Montar custo/markup na aba "Draft" e definir o preço mínimo.',
    '  7. Gerar a proposta (aba "Proposta") - UMA POR EMPRESA.',
    '  8. Acompanhar a entrega pós-vitória na aba "Empenho".',
    '  9. Montar o ZIP de habilitação na ordem do guia (3- DOCUMENTAÇÃO/).',
    ' 10. Rascunhar dúvidas e descartar versões em RASCUNHOS/trash/.',
    '',
    'REGRAS DE OURO',
    '  - Quantidade do item = soma do rateio por secretaria (nunca a célula isolada).',
    '  - Indicar MARCA de cada item na proposta: sem marca = desclassificação.',
    '  - Orçamento é sigiloso: preço acima do estimado = desclassificação.',
    '  - Nome dos documentos: NN - NOME DO DOCUMENTO DD-MM-AAAA.pdf.',
    '  - Uma proposta por empresa - não trocar o proponente no meio do processo.',
    '',
    '* Gerado pelo New Horizon. Em caso de divergência, vale o edital original.',
    '',
  ];

  return `${lines.join('\n')}\n`;
}

/** Gera os três arquivos de texto da árvore de pastas. */
export function buildTextArtifacts(
  parsed: EditalParsed,
  rootFolderName: string,
): TextArtifact[] {
  return [
    { filename: DOCUMENTOS_NECESSARIOS_FILENAME, content: buildDocumentosNecessariosTxt(parsed) },
    { filename: GUIA_DOCUMENTOS_FILENAME, content: buildGuiaDocumentosTxt(parsed) },
    { filename: LEIA_ME_FILENAME, content: buildLeiaMeTxt(parsed, rootFolderName) },
  ];
}
