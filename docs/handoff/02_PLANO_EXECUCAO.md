# 02 — PLANO DE EXECUÇÃO

## Fase 0 — Fundação (1–2 dias)
- Scaffold React + TS + Vite + Tailwind; projeto Supabase; deploy inicial Vercel.
- Auth + tabela `empresas` + tela de cadastro + upload de timbre.
- **Entrega:** login funcionando e empresa cadastrada.

## Fase 1 — Análise do edital (MVP core)
- `pdf.js` → texto → parser (regex/heurística) → objeto `EditalParsed`.
- Tela de revisão com campos editáveis; salvar em `editais` + `edital_itens`.
- Baseline: portar o que já validamos em `06_CONTRATO_DADOS_edital.json`
  (35 itens, rateio por secretaria, prazos, metadados).
- **Entrega:** subir PDF → itens e metadados preenchidos e editáveis.

## Fase 2 — Geração local (File System Access API)
- Seletor de pasta destino + montar árvore no padrão (`04_ESTRUTURA_PASTAS.md`).
- `exceljs` → planilha exata (só itens+qtd) — `05_LAYOUT_PLANILHA.md`.
- TXT de documentos necessários + guia + LEIA-ME.
- Checklist com status.
- **Entrega:** pasta completa no disco, menos anexos.

## Fase 3 — Anexos
- Extrair templates de anexos do próprio PDF do edital.
- lib `docx` → Anexo II + declarações preenchidas (timbre).
- Perguntas dinâmicas só do que varia (itens, datas).
- **Entrega:** `.docx` prontos para assinar.

## Fase 4 — Polimento MVP 01
- UX "sass", estados de loading/erro, validações.
- Segurança/RLS; testes com 2–3 editais reais de formatos diferentes.
- **Entrega:** MVP 01 utilizável ponta a ponta.

## Fase 5 — Hardening (opcional)
- Agente local sútil (Electron/Tauri) se a FS Access API não bastar.
- Exportar PDF dos anexos; ZIP de habilitação; log de cotações.

## Entregáveis por fase
`analisar → DB` · `estrutura de pastas` · `planilha` · `documentos.txt+guia` ·
`anexos.docx` · `checklist` · `ZIP`.

## Critérios de aceite MVP 01
- [ ] Login e cadastro de 2 empresas com timbre.
- [ ] Upload de edital → itens/metadados extraídos (com revisão).
- [ ] Pasta criada no padrão MAIÚSCULO escolhido pelo usuário.
- [ ] Planilha idêntica ao layout, itens+qtd corretos (rateio por secretaria).
- [ ] TXT de documentos + guia + LEIA-ME gerados.
- [ ] Anexo II (Proposta) gerado em .docx.
- [ ] Declarações principais geradas em .docx.
- [ ] Nada de segredo hardcoded; buckets privados com RLS.
