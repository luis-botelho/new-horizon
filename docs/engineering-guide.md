# Guia de Engenharia de Frontend e UX

## Design System
- **Tokens:** `src/styles/_tokens.scss`. Componentes usam só `var(--nh-*)`. Cores de prazo (`--nh-deadline-*`) e risco (`--nh-risk-*`) são semânticas.
- **Componentes base** (`shared/ui`): `Button`, `TranslatedText`, `FeatureBoundary`. Sem regra de negócio.
- **Identidade:** o elemento memorável é a "linha do horizonte" (`DeadlineMeter`): quanto do prazo já passou. O resto fica quieto.
- **Tipografia:** Bricolage Grotesque (títulos) e Public Sans (texto), via `next/font`.

## UX Copy
| Juridiquês | New Horizon |
|---|---|
| Habilitação jurídica, fiscal e trabalhista | Papelada que prova que sua empresa está em dia |
| Impugnação ao edital | Contestar uma regra do edital |
| Adjudicação do objeto | O órgão confirmou que você ganhou |
| Prazo recursal | Tempo que você tem para discordar do resultado |

Botões com verbo direto ("Ver o que falta"). Erros assumem a culpa do sistema e dizem o que fazer. Mostre a tradução **e** o texto oficial.

## Padrões de código
- **TypeScript:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Sem `any`.
- **Fronteiras:** toda resposta externa passa por Zod (`schemas.ts`).
- **Erros:** `app/error.tsx` é o último recurso; `FeatureBoundary` isola cada feature. Boundaries não pegam erro em event handlers ou código assíncrono: use `onError` do TanStack Query e `try/catch`.
- **Estado:** servidor no TanStack Query (com atualização otimista e rollback), filtros no Zustand **sempre com selectors**.
- **Regras de negócio** (ex.: `canMove`) são funções puras, testadas e reutilizadas no servidor.
- **Acessibilidade:** mover card por `select` rotulado já funciona por teclado; drag-and-drop virá com `dnd-kit` como camada extra, nunca como único caminho.
