# 00 — LEIA PRIMEIRO

Pacote de handoff do projeto **APP DE LICITAÇÃO (SaaS)** — MVP 01.

Este pacote nasceu da engenharia reversa do processo de licitação da empresa
(Grupo CMV / JLV + A.Luz) para o Pregão 90.070/2026 (PNCP 552/2026) da
Prefeitura de Angra dos Reis. A ideia: transformar a metodologia que a empresa
já escreveu num **app web** que recebe o edital em PDF, analisa, monta a pasta
no padrão da empresa, gera os anexos em Word prontos para assinar e guia o
usuário passo a passo.

## Ordem de leitura
1. `01_BRAINSTORM_USERFLOW.md` — a visão e o fluxo completo do produto.
2. `04_ESTRUTURA_PASTAS.md` — o PADRÃO de pastas/nomes (inviolável).
3. `05_LAYOUT_PLANILHA.md` — o layout EXATO da planilha a replicar.
4. `10_MODUS_OPERANDI.md` — os 10 passos do processo atual (a metodologia).
5. `08_ENTIDADES_E_ANEXOS.md` — documentos e anexos exigidos.
6. `02_PLANO_EXECUCAO.md` — fases e tarefas.
7. `07_SCHEMA_SUPABASE.sql` + `09_EMPRESAS_SEED.json` — dados.
8. `12_ROADMAP_E_BACKLOG.md` — para onde vai depois do MVP.
9. `13_CHECKLIST_INFRA.md` — subir Supabase + Vercel (free).
10. `03_GUIA_DOCUMENTACAO.md` — o que já foi feito e por quê.
11. `11_PROMPT_INICIAL_OUTRO_CHAT.md` — cole isto no outro chat para começar.

## Stack (tudo free)
React + TypeScript + Vite + Tailwind · Supabase (auth/db/storage) · Vercel ·
File System Access API (escreve no PC pelo navegador) · pdf.js · exceljs · docx.

## Regra de ouro
Nada aqui inventa formato: pastas, nomes de arquivo e planilha seguem
**exatamente** o padrão do repositório de origem. TUDO EM MAIÚSCULO.
