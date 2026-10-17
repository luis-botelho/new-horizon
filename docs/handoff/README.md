# Handoff — Metodologia de licitação (referência de domínio)

Pacote de metodologia da empresa, copiado de `pasta exemplo/ferramentas/handoff/`
(entidade local, **não versionada** por conter dados reais).

> **Saneamento aplicado:** em `06_CONTRATO_DADOS_edital.json` e
> `09_EMPRESAS_SEED.json` foram removidos CPF, RG, nome de representante,
> telefone, e-mail e dados bancários (dados pessoais — LGPD).
> Identificação da empresa (razão social, CNPJ, IE, endereço — dados públicos
> de registro) foi preservada para manter o caso-base reconhecível.

## Ordem de leitura
1. `04_ESTRUTURA_PASTAS.md` — árvore de pastas **inviolável** (MAIÚSCULO).
2. `05_LAYOUT_PLANILHA.md` — layout exato da planilha mestre.
3. `06_CONTRATO_DADOS_edital.json` — contrato do objeto `EditalParsed` (35 itens).
4. `10_MODUS_OPERANDI.md` — os 10 passos do processo atual.
5. `08_ENTIDADES_E_ANEXOS.md` — documentos exigidos e anexos.
6. `02_PLANO_EXECUCAO.md` — fases do MVP.
7. `07_SCHEMA_SUPABASE.sql` — schema + RLS (base p/ migração futura).

## Regras que o código deve obedecer
- Raiz: `{NUMERO}-{PREFEITURA}-{TIPO}` sempre em MAIÚSCULO, separador `" - "`.
- Quantidade do item = **soma do rateio por secretaria** (nunca a célula isolada).
- Planilha replica o layout de `05_` com fórmulas (`MIN`, `ROUND(CUSTO×(1+MARKUP),2)`).
- Uma proposta por empresa a partir do mesmo conjunto de itens.

Ver `docs/HANDOFF.md` para o estado atual da implementação.