# 12 — ROADMAP E BACKLOG

## Backlog priorizado (MVP 01)
### P0 — fundação
- [ ] Scaffold React+TS+Vite+Tailwind, deploy Vercel
- [ ] Supabase: rodar `07_SCHEMA_SUPABASE.sql`, ativar Auth
- [ ] Login/logout + proteção de rotas
- [ ] Cadastro de empresas (CRUD) + upload de timbre

### P1 — análise do edital
- [ ] Upload PDF + `pdf.js` (client-side)
- [ ] Parser genérico (regex/heurística) → `EditalParsed`
- [ ] Tela de revisão editável dos itens/metadados
- [ ] Salvar `editais` + `edital_itens`

### P2 — geração local
- [ ] Seletor de pasta destino (File System Access API)
- [ ] Criar árvore no padrão MAIÚSCULO
- [ ] Gerar planilha `.xlsx` (exceljs) com itens+qtd
- [ ] Gerar TXT documentos + guia + LEIA-ME
- [ ] Checklist com status e alerta de validade

### P3 — anexos
- [ ] Extrair templates de anexos do PDF
- [ ] Gerar Anexo II (Proposta) em `.docx`
- [ ] Gerar declarações V–IX, item 7.11, 12.1.2, ME/EPP em `.docx`
- [ ] Inserir timbre (upload/padrão)
- [ ] Perguntas dinâmicas do que varia

### P4 — polimento
- [ ] UX sass, estados, validações, mensagens de erro
- [ ] Testes com 2–3 editais de formatos diferentes
- [ ] Exportar PDF dos anexos
- [ ] ZIP único de habilitação

## Features futuras (pós-MVP / SaaS comercial)
- IA para ler/validar edital e certidões; auto-preenchimento.
- Alertas de prazos (e-mail/push/WhatsApp).
- Biblioteca de documentos com controle de vencimento central.
- Histórico de pregões e resultados; estatísticas.
- Marketplace de fornecedores / cotações.
- Precificação automática e robô de lances (usar com cautela/legalidade).
- Multiusuário/equipes, permissões, plano pago.
- App desktop sútil (Tauri/Electron) empacotando tudo.

## Ideias fora da caixa
- "Modo comparação": 2 empresas concorrendo no mesmo edital, evitar erro.
- "Auditor de proposta": confere se marca está preenchida em todo item.
- "Simulador de orçamento sigiloso" (sem violar regras).
- Integração direta com ComprasGov/PNCP (importar edital por nº).

## Métricas de sucesso do MVP
- Tempo de preparo de um pregão: de horas → minutos.
- Zero erro de quantidade (rateio). 
- Anexos sem campos faltantes.
