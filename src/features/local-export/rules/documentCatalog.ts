// Catálogo de habilitação da empresa (seções A–E + declarações extras).
// Fonte única para o checklist "00 - DOCUMENTOS NECESSÁRIOS.txt" e para a
// conferência guia × arquivos (rules/audit.ts):
//   - `text`  = como o item aparece no checklist;
//   - `keywords` = trechos que o nome real do arquivo costuma trazer.
// Curadoria das keywords a partir da árvore real da empresa
// (pasta exemplo/3- DOCUMENTAÇÃO/ — gitignorada por LGPD): nomes como
// "4- CND FEDERAL 24-01-2027.pdf", "5-CERTIDAO NEGATIVA DE DEBITOS
// ESTADUAL  28.10.2026.pdf", "14 - FGTS  10.11.2026.pdf" (caixa alta e sem
// acento — por isso a comparação normaliza os dois lados).
// A conferência é HEURÍSTICA (substring): serve de alerta para conferência
// humana, nunca de veredito — itens condicionais ("se houver") podem não se
// aplicar ao certame ou à empresa. Em caso de divergência, vale o edital.

export interface ChecklistEntry {
  text: string;
  keywords: string[];
}

export interface DocumentSection {
  code: string;
  title: string;
  entries: ChecklistEntry[];
}

/** Catálogo de habilitação (seções A–E), fiel ao checklist da empresa. */
export const HABILITACAO_SECTIONS: DocumentSection[] = [
  {
    code: 'A',
    title: 'HABILITAÇÃO JURÍDICA',
    entries: [
      {
        text: 'Registro comercial (se empresário individual)',
        keywords: ['registro comercial'],
      },
      {
        text: 'Contrato Social / Estatuto em vigor, registrado, com chancela digital',
        keywords: ['contrato social', 'estatuto'],
      },
      {
        text: 'Documentos de designação dos administradores (se em ato separado)',
        keywords: ['designação de administradores', 'nomeação de administradores', 'administrador'],
      },
      {
        text: 'Alterações consolidadas com todas as cláusulas em vigor (se houver)',
        keywords: ['alteração consolidada', 'alterações consolidadas', 'consolidação'],
      },
    ],
  },
  {
    code: 'B',
    title: 'HABILITAÇÃO ECONÔMICO-FINANCEIRA',
    entries: [
      {
        text: 'Balanço patrimonial e demonstrações dos 2 últimos exercícios, registrados na Junta Comercial',
        keywords: ['balanço patrimonial', 'demonstrações financeiras'],
      },
      {
        text: 'Termos de abertura e encerramento do Livro Diário',
        keywords: ['termo de abertura', 'termo de encerramento', 'livro diário'],
      },
      {
        text: 'Índices calculados e demonstrados: ILG >= 1, ILC >= 1, IE <= 1 (fórmulas no guia)',
        keywords: ['índices de liquidez', 'índice de liquidez'],
      },
      {
        text: 'Alternativa aos índices: Patrimônio Líquido >= 10% do valor estimado da contratação',
        keywords: ['patrimônio líquido'],
      },
      {
        text: 'Certidões negativas de falência e recuperação judicial/extrajudicial',
        keywords: ['falência', 'concordata', 'recuperação judicial'],
      },
      {
        text: 'Anexo VII - Declaração de integralidade dos custos trabalhistas',
        keywords: ['integralidade', 'anexo vii'],
      },
    ],
  },
  {
    code: 'C',
    title: 'HABILITAÇÃO FISCAL',
    entries: [
      {
        text: 'CNPJ com quadro societário atualizado',
        keywords: ['cnpj'],
      },
      {
        text: 'Inscrição estadual ou municipal pertinente ao objeto (quando exigida)',
        keywords: ['inscrição estadual', 'inscrição municipal'],
      },
      {
        text: 'Certidão Conjunta Negativa de Débitos Federais (Receita Federal + PGFN)',
        keywords: ['cnd federal', 'certidão conjunta', 'débitos federais'],
      },
      {
        text: 'Certidão estadual (ICMS) + Certidão da Dívida Ativa Estadual',
        keywords: [
          'débitos estadual',
          'débitos estaduais',
          'dívida ativa estadual',
          'estadual dívida',
          'icms',
        ],
      },
      {
        text: 'Certidão municipal (ISS) + Dívida Ativa Municipal (e IPTU, se a sede for no município)',
        keywords: ['iptu', 'iss', 'certidão municipal', 'dívida ativa municipal'],
      },
      {
        text: 'CRF-FGTS (Certificado de Regularidade do FGTS)',
        keywords: ['fgts'],
      },
    ],
  },
  {
    code: 'D',
    title: 'HABILITAÇÃO SOCIAL E TRABALHISTA',
    entries: [
      {
        text: 'Declaração de não emprego de menor (item D.1 do edital)',
        keywords: ['emprego de menor', 'não emprego', 'menor de idade'],
      },
      {
        text: 'CNDT - Certidão Negativa de Débitos Trabalhistas (ou positiva com efeito negativo)',
        keywords: ['cndt', 'débitos trabalhistas'],
      },
      {
        text: 'Anexo VIII - Declaração de reserva de cargos para PCD/reabilitado',
        keywords: ['reserva de cargos', 'anexo viii'],
      },
    ],
  },
  {
    code: 'E',
    title: 'QUALIFICAÇÃO TÉCNICA',
    entries: [
      {
        text: 'Atestado(s) de capacidade técnica compatível com o objeto, emitido por terceiro (não vale o da própria licitante)',
        keywords: ['atestado'],
      },
    ],
  },
];

/** Declarações complementares exigidas como anexo ou campo do sistema. */
export const DECLARACOES_EXTRAS: string[] = [
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
