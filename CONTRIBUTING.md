# Contribuindo

0. **Antes de mexer:** o estado do código, o mapa das features e os próximos
   passos estão em [`docs/HANDOFF.md`](docs/HANDOFF.md) — leia ele, não o repo
   inteiro. Decisões arquiteturais em [`docs/adr/`](docs/adr).
1. Crie uma branch a partir de `main` e use [Conventional Commits](https://www.conventionalcommits.org).
2. Antes do PR: `npm run typecheck && npm test && npm run build`.
3. Regras que não negociamos:
   - **Estilos só em SCSS Modules** consumindo `var(--nh-*)`. Sem Tailwind, sem hex direto em componente.
   - **Proibido `any`.** Use `unknown` e valide com Zod.
   - **Dinheiro em centavos** (`Cents`), IDs com branded types.
   - **Uma feature não importa de outra.** Compartilhou? Vai para `shared/`.
   - Cor nunca é o único indicador de prazo ou risco: some ícone e texto.
   - Copy sem "garantido", "lucro certo" ou "ganho fácil".
