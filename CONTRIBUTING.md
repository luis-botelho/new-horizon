# Contribuindo

1. Crie uma branch a partir de `main` e use [Conventional Commits](https://www.conventionalcommits.org).
2. Antes do PR: `npm run typecheck && npm test`.
3. Regras que não negociamos:
   - **Estilos só em SCSS Modules** consumindo `var(--nh-*)`. Sem Tailwind, sem hex direto em componente.
   - **Proibido `any`.** Use `unknown` e valide com Zod.
   - **Dinheiro em centavos** (`Cents`), IDs com branded types.
   - **Uma feature não importa de outra.** Compartilhou? Vai para `shared/`.
   - Cor nunca é o único indicador de prazo ou risco: some ícone e texto.
   - Copy sem "garantido", "lucro certo" ou "ganho fácil".
