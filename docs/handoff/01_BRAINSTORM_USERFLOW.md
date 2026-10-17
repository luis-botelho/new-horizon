# 01 — BRAINSTORM + USERFLOW

## 1. Visão
Um app web que transforma **1 PDF de edital** numa **pasta inteira organizada +
guia + anexos prontos para assinar**. Ele embute a metodologia que a empresa já
criou (guias 00–05 do repositório) e a **executa**, em vez de só documentá-la.
MVP 01 = organizar + guiar + gerar anexos/planilha. IA e automações avançadas
vêm depois.

## 2. Problema que resolve
- Retrabalho: os mesmos 35 itens digitados em 8+ planilhas.
- Erro grave: item 12 salvo como `3.951` (deveria ser `3951`) → proposta de
  R$ 212,76 em vez de R$ 184.393,17.
- Descrições com lixo `[cite: 29]`.
- Anexos/declarações feitos do zero a cada pregão.
- Certidões vencendo sem alerta.

## 3. Persona
Operador de licitação (Jefferson / Grupo CMV), não-técnico, ambiente **Windows**.
Quer "só funcionar": sobe o PDF e recebe tudo pronto.

## 4. Stack (free tier)
- **Frontend:** React + TypeScript + Vite + Tailwind (roda no navegador).
- **Backend/DB/Auth/Storage:** Supabase (free).
- **Deploy:** Vercel (free).
- **Acesso ao PC:** File System Access API (Chrome/Edge) — cria pastas/arquivos
  direto no destino escolhido, **sem instalar nada**. Plano B: agente local
  Node/Electron/Tauri "sútil" via localhost.
- **PDF parse:** `pdf.js` (client-side).
- **XLSX:** `exceljs` — replica EXATAMENTE a planilha dele.
- **DOCX:** lib `docx` — anexos Word editáveis.
- **PDF dos anexos:** impressão client-side; timbre = imagem do user ou padrão.
- **IA:** fase futura.

## 5. Userflow (MVP 01)
1. **Login** (Supabase Auth).
2. **Cadastro de empresas** (A.Luz e JLV): razão social, CNPJ, IE, endereço,
   CEP, contato, representante, CPF/RG, banco/agência/conta, Simples/EPP,
   **timbre** (upload).
3. **Sobe o edital (PDF)**.
4. **App analisa** e mostra: nº pregão, órgão, objeto, tipo de material, sessão,
   prazos (validade/entrega/pagamento/garantia), critério, itens (nº, UNID,
   CATMAT, descrição, qtd, qtd por secretaria), anexos e declarações exigidas.
5. **Tela de revisão** (parser genérico + conferência humana). Nesta fase o app
   só avisa "adicione tais dados na planilha dos pregões" — não mexe no servidor.
6. **Escolhe a empresa** que vai entrar. App usa o que já tem cadastrado e
   **só pergunta o que falta** (ex.: quais itens entram, datas).
7. **Escolhe a pasta de destino** (File System Access API) — se não nomear, usa
   o padrão do repo.
8. **App gera a estrutura completa** + planilha + guia + anexos.

## 6. Fluxo resumido (stages técnicas)
```
[PDF] → ingestão → análise → revisão → escolha empresa → destino
      → gera pastas → gera planilha → gera TXT/guia/checklist → gera anexos
```

## 7. Geração de anexos
- O edital **geralmente já traz os exemplos** (Anexo I..IX) → o app **extrai os
  templates do próprio PDF** e os preenche.
- Preenche tudo que está no cadastro; **pergunta só o que varia** (itens, datas).
- Saída: `.docx` editável, válido, pronto para assinar e entregar.
- **A planilha de cotação já é um dos anexos**: dela sai a Proposta de Preços.
  O app só injeta **nome dos itens + quantidades**; o resto o usuário preenche.

## 8. MVP 01 — escopo
1. Auth + cadastro de empresas.
2. Upload + parse do edital (pdf.js) → revisão.
3. Seleção de empresa (usa cadastro, pergunta o que falta).
4. Geração da árvore de pastas no destino no padrão.
5. Planilha `.xlsx` exata só com itens+qtd.
6. TXT de documentos necessários + guia + LEIA-ME/checklist.
7. Anexo II + declarações `.docx` preenchidas.
8. Checklist com status (TÊM/NÃO TÊM) + alertas de vencimento.

## 9. Futuro (SaaS comercial)
IA para ler/validar edital e certidões; auto-preenchimento de anexos por IA;
alertas de prazos; multiusuário/equipes; marketplace de fornecedores; histórico
de pregões; precificação automática; cobrança SaaS.

## 10. Segurança
RLS estrito; buckets privados; nunca logar segredos; dados sensíveis
preferencialmente locais; LGPD; separar claramente A.Luz vs JLV para não trocar
o proponente.
