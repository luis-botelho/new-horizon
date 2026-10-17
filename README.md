<div align="center">

# 🌅 New Horizon

**A bolsa de oportunidades públicas. Licitações em linguagem humana.**

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![SCSS](https://img.shields.io/badge/SCSS-Modules-CC6699?logo=sass&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

</div>

## Visão

Todo ano o governo brasileiro compra centenas de bilhões de reais em bens e serviços por licitação. A maior parte dessa oportunidade fica fora do alcance dos pequenos negócios por causa do **juridiquês**: editais longos, termos herméticos, processos que intimidam.

O New Horizon quer ser o "Wall Street das Licitações": transparência de mercado, ferramentas profissionais e comunidade para que qualquer empreendedor consiga entender, disputar e vencer contratos públicos.

1. **Magia:** traduzimos o edital em linguagem simples, sempre com o texto oficial a um clique.
2. **Operador:** um Kanban que guia cada edital, da descoberta ao resultado.
3. **Transparência:** rankings de órgãos e pregões *(roadmap)*.
4. **Marketplace:** operadores e investidores *(roadmap, depende de parecer regulatório)*.

Além do produto acima, o app já roda um **motor local de back-office**: a partir
do JSON de um edital ele gera, **no navegador e sem enviar dados a lugar nenhum**,
a árvore de pastas padrão da empresa, a planilha mestre `.xlsx` com as fórmulas e
os `.txt` de guia/checklist. Acesse em **`/novo-edital`**.

> ⚠️ O New Horizon é uma ferramenta de apoio e **não constitui consultoria jurídica ou financeira**.

## Stack

Next.js (App Router) · React · TypeScript estrito · **SCSS Modules (sem Tailwind)** · TanStack Query (estado de servidor) · Zustand (estado de cliente) · Zod (validação nas fronteiras) · Vitest

## Arquitetura (Fase 1: MVP)

```
Navegador ── React (features) ──► /api/*  (Route Handlers do Next, mock em memória)
                                    │
                         Fase 2: backend real + Postgres
                                    │
                              PNCP (API pública)
```

- **Local:** `src/app/api/editais` serve dados simulados. Não precisa de backend.
- **Nuvem:** defina `NEXT_PUBLIC_API_URL` e o front passa a chamar a API real.

```
src/
├── app/          # rotas e composição (sem regra de negócio)
├── features/     # onboarding · operator-board · investor-pool · local-export
├── shared/       # ui, lib, types (sem regra de negócio)
└── styles/       # tokens, mixins e globals em SCSS
```

### Motor local de back-office (`/novo-edital`)

Fluxo **importar → revisar → exportar**, 100% no navegador (nada vai a
servidor). De um JSON de edital o app gera a árvore de pastas, a planilha mestre
e os TXTs no padrão da empresa. Escrita via **File System Access API**
(Chromium) com **fallback `.zip`** nos demais navegadores.

```
src/features/local-export/
├── rules/          # regras puras (rateio, nome de pasta, validade, TXTs)
├── spreadsheet/    # planilha .xlsx com fórmulas do Excel (exceljs)
├── fs/             # árvore, escrita em disco, .zip e detecção de modo
└── ui/             # NewEditalFlow (o fluxo da página)
```

**Regra de dependência:** `app → features → shared`. Uma feature **nunca** importa de outra. Código usado por duas features sobe para `shared`.

## Começando

Requisitos: Node ≥ 20.

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Desenvolvimento |
| `npm run build` / `npm start` | Build e execução de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Testes (Vitest) |

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_FEATURE_INVESTOR_POOL` | `false` | Liga o módulo do investidor. Lida **em build**. |
| `NEXT_PUBLIC_API_URL` | vazio | URL da API real. Vazio usa os Route Handlers locais. |

> `NEXT_PUBLIC_*` vai para o bundle do navegador. Nunca coloque segredos aqui.

## Roadmap

- [x] Esqueleto, design tokens, onboarding, Kanban do operador (mover com regras)
- [x] **Motor local de back-office** (`/novo-edital`): pastas + planilha mestre + TXTs, no navegador
- [ ] **Fase 1:** parser de edital para o fluxo local, drag-and-drop acessível (`dnd-kit`), tradutor de editais com LLM e guardrails, persistência
- [ ] **Fase 2:** radar com alertas; gamificação baseada em progresso real
- [ ] **Fase 3:** rankings de órgãos e transparência de pregões (depende da qualidade dos dados do PNCP)
- [ ] **Fase 4:** marketplace operador/investidor *(depende de parecer regulatório)*
- [ ] **Fase 5:** visão social de pregões; tokenomics *(depende de parecer regulatório)*

## Contribuindo

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) e as decisões em [`docs/adr/`](docs/adr). Licença MIT.
