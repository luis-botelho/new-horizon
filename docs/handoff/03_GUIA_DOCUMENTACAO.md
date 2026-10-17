# 03 — GUIA DE DOCUMENTAÇÃO (o que já foi feito e por quê)

Documenta a etapa de engenharia reversa que originou este pacote.

## O que foi feito
- **Engenharia reversa** do processo: mapeamento do modus operandi (10 passos),
  gargalos e estrutura de dados (`10_MODUS_OPERANDI.md`).
- **`edital.json`** — fonte única (35 itens + metadados + 2 empresas), gerado por
  `ferramentas/extrair_fonte.py` a partir da planilha mestre.
- **`ferramentas/gerar.py`** — gera as pastas e a planilha
  (Cotações/Draft/Empenho/Propostas) com fórmulas.
- **Correção do bug do item 12:** quantidade lida do **rateio por secretaria**
  (SDSP 400 + SPDC 3551 = 3951), não da célula corrompida `3.951`.
- **Limpeza automática de `[cite:]`** nas descrições.

## Por quê (problema → solução)
| Problema | Solução |
|---|---|
| Digitar item×fornecedor à mão | Itens em fonte única |
| Descrição em 8+ abas | Preenchimento automático |
| Markup célula-a-célula | Fórmula + parâmetro único |
| Item 12 = 3,951 | Rateio por secretaria |
| `[cite:]` no texto | Regex de limpeza |

## Decisões técnicas e justificativa
- **Fórmula em vez de valor** → o usuário edita e recalcula.
- **JSON como fonte única** → uma digitação, tudo deriva.
- **Manter nomes/estrutura** do escritório (nada de reestruturar a pasta dele).

## Como reexecutar o baseline (já funcional)
```
python3 ferramentas/extrair_fonte.py     # lê a planilha mestre -> edital.json
python3 ferramentas/gerar.py <destino>   # gera pastas + planilha
```

## Validação já feita
Recalculo com LibreOffice headless: item 12 → `35,90 × 3951 = R$ 184.393,17`
(antes o arquivo trazia `R$ 212,76`). Fórmulas e Proposta conferidas.

## Direção
Transformar o baseline (script Python) no **app web SaaS** descrito em
`01_BRAINSTORM_USERFLOW.md`, reaproveitando o contrato de dados
(`06_CONTRATO_DADOS_edital.json`) e o layout (`05_LAYOUT_PLANILHA.md`).
