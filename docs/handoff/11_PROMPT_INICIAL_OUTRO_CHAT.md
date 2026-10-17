# 11 — PROMPT INICIAL (cole no outro chat)

---

Você vai me ajudar a construir o **MVP 01 de um SaaS de licitações** (web app,
free tier). Leia primeiro os documentos do pacote `handoff/` que vou anexar e
use-os como contrato de projeto. Resumo:

## Objetivo do MVP
Usuário faz login, sobe o **PDF de um edital**, o app **analisa**, **monta a
pasta no padrão da empresa** no PC do usuário (via File System Access API),
**gera a planilha exata**, **gera TXT/guia/checklist** e **gera os anexos em
Word (.docx) já preenchidos** (com timbre), prontos para assinar. Ele só
preenche o que varia (itens que entram, datas, preços).

## Stack (tudo grátis)
- React + TypeScript + Vite + Tailwind (roda no navegador).
- Supabase (auth, banco, storage) — usar `07_SCHEMA_SUPABASE.sql`.
- Deploy na Vercel.
- Acesso ao PC: File System Access API (Chrome/Edge). Plano B: agente local
  Node/Electron/Tauri sútil, via localhost.
- Parsing PDF: `pdf.js`. XLSX: `exceljs`. DOCX: `docx`. PDF final: impressão
  client-side. IA: fase futura.

## Regras invioláveis
1. Pastas e nomes seguem **exatamente** o padrão em `04_ESTRUTURA_PASTAS.md`
   (TUDO EM MAIÚSCULO).
2. A planilha replica **exatamente** `05_LAYOUT_PLANILHA.md`.
3. Quantidade dos itens = **soma do rateio por secretaria** (nunca a célula QT
   isolada — foi a causa de um bug real).
4. Nada de segredos no código; buckets privados + RLS.
5. Separar A.Luz e JLV (não trocar proponente).

## Contrato de dados
Use `06_CONTRATO_DADOS_edital.json` como formato do objeto `EditalParsed`.
Seed de empresas em `09_EMPRESAS_SEED.json`.

## Onde começar (Fase 0–1)
1. Scaffold do projeto + Tailwind + Supabase client + rota de login.
2. Tela de cadastro de empresa (tabela `empresas`), com upload de timbre.
3. Tela "Novo edital": upload PDF → pdf.js → parser → tela de revisão dos itens
   (usar o JSON de contrato como alvo).
4. Ao confirmar, salvar `editais` + `edital_itens` no Supabase.

Pode propor a estrutura de pastas do código antes de começar. Pergunte se algo
do pacote estiver ambíguo. Depois seguimos para a Fase 2 (geração no disco).

---
