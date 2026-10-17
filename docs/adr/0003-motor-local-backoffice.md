# ADR 0003: Motor local de back-office (navegador) antes de backend

- **Status:** aceito
- **Data:** 2026-10-17
- **Contexto:** a empresa opera editais com três artefatos fixos — uma árvore de
  pastas no Windows, uma planilha mestre `.xlsx` com fórmulas e arquivos `.txt`
  de guia/checklist. Hoje isso é feito à mão e por um script Python
  (`pasta exemplo/ferramentas/gerar.py`). O handoff original propunha backend +
  banco antes da ferramenta. Os artefatos, porém, são 100% deriváveis de um JSON
  de edital e o usuário já tem os dados em mãos — não há dependência de rede,
  banco ou auth para a primeira entrega de valor.
- **Decisão:** implementar a geração desses três artefatos **dentro do
  navegador**, em TypeScript, estendendo o app Next.js + SCSS Modules já existente
  (ADR 0001). Nada é enviado a servidor; o JSON do edital nunca sai da máquina.
  A escrita usa a File System Access API (Chromium) com fallback `.zip` nos
  demais navegadores.
- **Consequências:**
  - Entrega de valor imediata e auditável (o usuário vê o arquivo gerado na hora).
  - Nenhum custo de infra e nenhuma superfície de LGPD nova (dados só no cliente).
  - O `gerar.py` vira **esqueleto de referência**: o port para TS deve replicar
    layout e fórmulas, e os testes fixam esse comportamento.
  - Limitação: sem File System Access o fluxo termina em `.zip` que o usuário
    descompacta e renomeia (aceito e explicado na UI).
  - O que ficou de fora (parser de PDF, sync com Supabase, dnd-kit, tradução por
    LLM) é próximo passo, não pré-requisito — ver `docs/handoff/12_ROADMAP_E_BACKLOG.md`.
- **Alternativas consideradas:**
  - Backend + banco antes da ferramenta (handoff original): adia o valor real e
    adiciona auth/infra sem necessitar delas nesta fase.
  - Reescrever em Vite/Tailwind conforme o protótipo do handoff: rejeitado pelo
    ADR 0001 — o app Next.js + SCSS Modules é a base mantida.
