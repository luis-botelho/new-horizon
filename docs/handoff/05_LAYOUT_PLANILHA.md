# 05 — LAYOUT DA PLANILHA (replicar EXATAMENTE)

A planilha mestre é `5522026.xlsx`. O app deve gerar o **mesmo layout**, só
injetando **ITEM + QT + UNID + DESCRIÇÃO** (e o rateio por secretaria). O
usuário preenche o resto.

## Regra crítica de quantidade
A quantidade **NUNCA** vem da célula isolada `QT`. Vem do **rateio por
secretaria** (colunas SDSP, SPDC, sec3…form).

Exemplo real que causou o bug:
- Célula QT = `3.951` (lido como decimal)
- Rateio: SDSP 400 + SPDC 3551 = **3951** ✅
- O app usa a SOMA do rateio.

Se a soma divergir da célula, marcar o item e alertar.

---

## Aba `Cotações`
Cabeçalho linha 1: `PREGÃO | … | COTAÇÃO 1 | COTAÇÃO 2 | COTAÇÃO 3 | COTAÇÃO 4 |
RESULTADO DAS COTAÇÕES | MARKUP | EST/CUSTO | … | MÍNIMO | PROPOSTA PREÇO
INICIAL | ROBÔ (colar valores) | ROBÔ + 15% | ROBÔ + 30%`

Colunas essenciais:
```
A ITEM | B QT | C UNID | D DESCRIÇÃO | E GRUPO
F SDSP | G SPDC | H..T sec3..form (rateio por secretaria)

-- COTAÇÃO 1 (V..AC) --
V MARCA | W PRODUTO | X IMPOSTO | Y FRETE | Z PR UNIT | AA PR TOTAL
AB CONTATO | AC EMPRESA
-- COTAÇÃO 2 (AD..AK) -- idem
-- COTAÇÃO 3 (AL..AS) -- idem
-- COTAÇÃO 4 (AT..BA) -- idem (opcional)

-- RESULTADO (BC..BE) --
BC MARCA | BD CUSTO UNIT | BE CUSTO TOTAL

-- MARKUP / RESULTADO --
BF/BG 1.3 (PR IT / PR TT) | BJ/BK 1.6 (PR IT / PR TT)
BL MARKUP % | BM CUSTOS GERAIS
BN/BO/BP LUCRO % / $ / $ (SEM FRETE) | BR/BS/BT (COM FRETE)
BU/BV ESTIMADO (PRÉÇO DO EDITAL) PR IT / PR TT
BW/BX/BY MARKUP % / VALOR / TOTAL (MÍNIMO)
BZ/CA MÍNIMO POR GRUPO | CB/CC PROPOSTA PREÇO INICIAL UNIT/TOTAL
CD.. ROBÔ (colar valores), +15%, +30%
```

Fórmulas no resultado:
- `PR TOTAL (cotação) = PR UNIT × QT`
- `MENOR CUSTO = MIN(PR UNIT das cotações preenchidas)`
- `PREÇO MÍNIMO = ROUND(CUSTO × (1 + MARKUP), 2)`
- `PREÇO TOTAL = PREÇO MÍNIMO × QT`

Itens ocupam as linhas 4..38 (35 itens). O app lista só os itens do edital.

---

## Aba `Proposta` (por empresa)
Cabeçalho com bloco da empresa (linhas 1–6):
```
<RAZÃO SOCIAL>
CNPJ.: <CNPJ>   Inscrição Estadual <IE>
<ENDEREÇO>
<MUNICÍPIO - UF>
Email: <EMAIL> TEL <TELEFONE>
Angra dos Reis, <DATA>
<parágrafo de submissão> Simples Nacional. Pagamento 30 dias. Garantia 12 meses.
Dados bancários: <BANCO AGENCIA C/C>  Validade: <DIAS>  Entrega conforme Edital
```
Tabela (linha 7+):
```
ITEM | QUANT | UNID | DESCRIÇÃO | MARCA | PREÇO ITEM | PREÇO TOTAL
```
`PREÇO TOTAL = PREÇO ITEM × QUANT`.

---

## Aba `Draft`
```
ITEM | QT | UNID | DESCRIÇÃO | MARCA | CUSTO UNIT | CUSTO TOTAL
| MARKUP (%) | MÍNIMO ($) | TOTAL ($) | [EDITAL: MARKUP (%) | UNITARIO ($)]
```
- `MARKUP` = razão custo→mínimo (ex.: 1.30).
- `MÍNIMO = ROUND(CUSTO × MARKUP, 2)`, `TOTAL = MÍNIMO × QT`.

---

## Aba `Empenho`
```
ITEM | QT | UNID | DESCRIÇÃO
| COTAÇÃO: MARCA | PRODUTO | IMPOSTO | FRETE | PR UNIT FINAL | PR TOTAL | CONTATO
| (controle de entrega: EMPENHO | QTD ENTREGUE | SALDO | DATA | NF | OBS)
```

---

## Abas de readequação (multi-empresa)
`Readequada A.Luz` e `Readequada JLV` = cópias normalizadas da proposta por
empresa. O app gera **uma proposta por empresa** a partir do mesmo conjunto de
itens, evitando digitação dupla.

## Formatos numéricos
- Valores **até os centavos** (2 casas).
- Quantidades inteiras (cuidado com separador decimal).
- Nunca deixar `#VALUE!` / `#REF!` (validar antes de exportar).
