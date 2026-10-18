# HANDOFF — Motor Local de Back-office (construído)

> **Para a próxima IA/dev:** leia `docs/handoff/00_LEIA_PRIMEIRO.md` e este
> arquivo antes de mexer. Aqui está o que **já existe**, onde está e como
> verificar. O restante de `docs/handoff/` é contexto de produto (não código).

## O que foi entregue

Fluxo `importar → revisar → exportar` em `/novo-edital`, rodando 100% no
navegador. A importação lê o **PDF assinado do edital** (pdfjs-dist roda no
navegador e um parser puro de texto extrai meta e itens) ou aceita um JSON
pronto (contrato `EditalParsed`). A revisão é um form editável da meta — o
parser pode deixar campos parciais, o humano completa — e na validação final o
app gera:

1. a **árvore de pastas** no padrão da empresa (`04_ESTRUTURA_PASTAS.md`);
2. a **planilha mestre** `.xlsx` com as fórmulas do `gerar.py` (`05_LAYOUT_PLANILHA.md`);
3. os **TXTs** de documentos necessários, guia e LEIA-ME.

Nada sai do navegador (ver `docs/adr/0003-motor-local-backoffice.md`).

## Onde está o código

```
src/features/local-export/
├── rules/          # regras PURAS (fáceis de testar, sem DOM)
│   ├── quantity.ts        # QT = soma do rateio (regra de ouro)
│   ├── folderName.ts      # nome da pasta raiz + sugestões
│   ├── documentExpiry.ts  # validade no nome do arquivo
│   └── txtGuides.ts       # gera os 3 arquivos .txt
├── spreadsheet/generateWorkbook.ts   # planilha via exceljs (fórmulas do Excel)
├── fs/
│   ├── tree.ts           # monta a lista de entradas (pastas + arquivos)
│   ├── writeDirectory.ts # File System Access (interface testável)
│   ├── zipFallback.ts    # .zip via jszip
│   └── capabilities.ts   # detecta o modo (SSR-safe)
└── ui/NewEditalFlow.tsx  # o fluxo importar→revisar→exportar
                          # (form editável da meta; export valida com Zod)

src/features/edital-parser/     # leitura de PDF → meta+itens (sem regra da outra feature)
├── text/                       # parser puro: limpeza, parseMeta, parseItens + fixtures
├── pdf/extractPdfText.ts       # pdfjs-dist no navegador (worker empacotado, sem CDN)
└── ui/PdfImportSlot.tsx        # botão "Ler PDF do edital" do passo 1

src/shared/data/companiesSeed.ts  # seed saneado de empresas p/ importar por PDF
```

`src/app/novo-edital/NovoEditalClient.tsx` compõe as duas features (o único
lugar que pode cruzá-las) e `page.tsx` só roteia. Regra de negócio nunca fica
em `app/`.

## Regras de domínio (não quebre)

- **Quantidade** vem da **soma do rateio** (`qtd_sdsp+qtd_spdc+qtd_outras`),
  nunca da célula `qt_celula`. Bug real: célula `"3.951"` lida como decimal,
  rateio somava 3951. Ver `resolveItemQuantity` e a fixture em
  `src/shared/types/__fixtures__/editalSample.ts` (item 3).
- **Empresas não vêm do PDF**: na importação por PDF o adapter (só em `app/`)
  injeta o seed saneado `COMPANIES_SEED`; a primeira aba é `Proposta` e as
  demais `Readequada {apelido}` (ver `10_MODUS_OPERANDI.md`).
- **Fórmulas** da planilha são gravadas como fórmulas do Excel (o usuário edita
  e recalcula): `PR UNIT×QT`, `MIN(...)`, `ROUND(CUSTO×(1+MARKUP),2)`.
- **Markup** default `0.30` (30%), configurável na UI.
- **Árvore e abas** seguem `04_ESTRUTURA_PASTAS.md` e `05_LAYOUT_PLANILHA.md`.
- A **planilha fica em `2- COTAÇÃO/`** (não na raiz). Nome = dígitos do pregão.

## Verificação (rode sempre)

```bash
npm run typecheck   # tsc --noEmit
npm test            # Vitest — 113 testes
npm run build       # garante que a UI/SCSS compilam
```

`vitest.config.ts` espelha o alias `@/*` do tsconfig — se criar teste usando
`@/...`, já funciona.

## Convenções da casa

- Inglês para identificadores, português para comentários/docs/UI.
- Sem `any` (`unknown` + Zod). Zod em toda fronteira.
- SCSS Modules só com tokens `var(--nh-*)`. Sem hex direto.
- `app → features → shared`; feature nunca importa de feature.
- Commits Conventional Commits, um por entrega coesa.

## Próximos passos (não implementados)

- Itens da revisão hoje são só leitura (tabela): editar item a item na UI.
- Sync/backup no Supabase (`07_SCHEMA_SUPABASE.sql` está pronto, sem uso).
- Anexos `.docx` na subpasta `4- ANEXOS/` (hoje só a pasta é criada).
- Confere se o guia bate com os arquivos reais da pasta (`documentExpiry.ts`
  já extrai validade; falta casar guia × arquivos e alertar faltantes).
- dnd-kit no Kanban e tradutor de editais com LLM (ver roadmap).

## Dados

A pasta `pasta exemplo/` é **gitignorada por LGPD** (CPF, RG, dados bancários).
`docs/handoff/06_CONTRATO_DADOS_edital.json` é a versão **saneada** — use como
referência de formato. Dados sintéticos válidos: ver fixture `editalSample.ts`.
