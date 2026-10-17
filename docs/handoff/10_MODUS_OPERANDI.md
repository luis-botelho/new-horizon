# 10 — MODUS OPERANDI (processo atual)

Fluxo reconstituído por engenharia reversa da pasta do pregão. É a metodologia
que o app vai executar.

## Os 10 passos
1. **Baixa o edital** assinado do ComprasGov/PNCP → `1- EDITAL/`.
2. **Transcreve os 35 itens** do TR para a planilha mestre
   `2- COTAÇÃO/5522026.xlsx` aba `Cotações` (item, qtd, unid, descrição,
   qtd por secretaria SDSP/SPDC).
3. **Dispara pedidos de cotação** a fornecedores agrupados por categoria
   (`Solicitacao_de_Cotacao_JLV.xlsx`, mensagens por WhatsApp/e-mail).
4. **Recebe orçamentos** em PDF/JPG e salva em `COTAÇÃO 1/`, `COTAÇÃO 2/`.
5. **Digita à mão** cada cotação na aba `Cotações` (MARCA, PRODUTO, IMPOSTO,
   FRETE, PR UNIT, PR TOTAL, CONTATO, EMPRESA).
6. **Monta custo/markup** e o preço mínimo a ofertar (aba `Draft`).
7. **Gera a proposta** (Anexo II) por empresa (abas `Proposta`,
   `Readequada A.Luz`, `Readequada JLV`).
8. **Acompanha entrega** pós-vitória (aba `Empenho`).
9. **Monta o ZIP de habilitação** na ordem do checklist (`3- DOCUMENTAÇÃO/`).
10. **Rascunha dúvidas** e descarta versões (`RASCUNHOS/trash/`).

## Gargalos mapeados
1. Retrabalho de digitação item × fornecedor (centenas de células).
2. Descrição duplicada em 8+ abas/arquivos.
3. **Bug de localização numérica**: `3.951` lido como decimal (item 12).
4. Markup calculado célula a célula, com erros `#VALUE!`.
5. Rastreamento de fornecedor fragmentado em 3 planilhas.
6. Duplicação total para a 2ª empresa (A.Luz vs JLV).
7. Documentos controlados em `.txt` sem leitura de validade.
8. Zero vínculo auditável entre o PDF do orçamento e o item.

## O que o app automatiza (mapa gargalo → solução)
| Gargalo | Solução no app |
|---|---|
| Digitação item×fornecedor | Fonte única (edital.json) |
| Descrição em 8+ abas | Preenchimento automático |
| Item 12 = 3,951 | Rateio por secretaria |
| Markup célula-a-célula | Fórmula + parâmetro único |
| Fornecedor fragmentado | Tabela única de fornecedores |
| Duplicação multi-empresa | Proposta por empresa |
| Validade de docs | Parse do nome + alerta |
| Vínculo orçamento↔item | Log de cotações (futuro) |

## Dados-chave do certame-base
- Pregão 90.070/2026 · PNCP 552/2026 · UASG 985801 · Processo SEI-2025-06001343.
- Órgão: Prefeitura de Angra dos Reis (SDSP; participante SPDC).
- Critério: **menor preço por item** · Modo **aberto** · Orçamento **sigiloso**.
- Sessão: 16/10/2026 10:00 · Validade proposta 60/90 dias (divergência) ·
  Entrega 20 dias · Pagamento 30 dias · Garantia 12 meses.
- Regra de ouro: **indicar MARCA de cada item** (sem marca = desclassificação).
