# ADR 0001: Next.js + SCSS Modules + feature-first

**Status:** aceita

- **Next.js (App Router):** Route Handlers dão um backend mock sem infraestrutura extra e há caminho para SSR de páginas públicas (rankings, SEO).
- **SCSS Modules, sem Tailwind:** decisão do time. Tokens vivem em CSS variables (`src/styles/_tokens.scss`), o que permite tema escuro e white-label.
- **Feature-first:** o que muda junto fica junto; uma feature pode ser removida inteira (essencial para o módulo do investidor).
- **`app/` só roteia e compõe.** Regra de negócio fica em `features/`, em funções puras testáveis.
- **Estado por tipo:** servidor (TanStack Query), cliente global pequeno (Zustand), local (`useState`/`useReducer`), URL.
