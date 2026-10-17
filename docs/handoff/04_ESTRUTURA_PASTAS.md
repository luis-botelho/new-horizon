# 04 — ESTRUTURA DE PASTAS (PADRÃO INVIOLÁVEL)

## Regra de nome da pasta raiz
`{NUMEROPREGAO}-{NOMEDAPREFEITURAOUINSTITUIÇÃO}-{TIPODEMATERIALOUITEM}`

- Sempre **MAIÚSCULO**.
- Separador padrão do repo: `" - "` (espaço-hífen-espaço).
- Se o usuário não nomear, usar o padrão do repositório.

Exemplo (caso-base deste projeto):
```
5522026 - PREFEITURA - CAMA MESA
```

Variações aceitas (a definir no cadastro):
- `{NUM}-{PREFEITURA}-{TIPO}`  → `5522026 - PREFEITURA - CAMA MESA`
- `{NUM}-{PREFEITURA}-{OBJETO}` → `90070-2026 - ANGRADOSREIS - ENXOVAL`
- `{NUM}-{PREFEITURA}-{TIPO}`   → `123452026 - PREFEITURA - MATERIAIS DE LIMPEZA`

> O app deve SEMPRE oferecer o nome sugerido e permitir editar antes de criar.

## Árvore canônica
```
{NUM}-{PREFEITURA}-{TIPO}/
├── 1- EDITAL/                 → edital.pdf + ata.pdf
├── 2- COTAÇÃO/                → planilha mestre .xlsx + COTAÇÃO 1..N/ (orçamentos)
├── 3- DOCUMENTAÇÃO/           → certidões e documentos de habilitação
│   ├── 00 - DOCUMENTOS NECESSÁRIOS.txt
│   ├── 00 - GUIA DOS DOCUMENTOS.txt
│   └── 4- ANEXOS/             → Anexo II, V..IX em .docx prontos p/ assinar
└── LEIA-ME.txt                → como usar + passo a passo da metodologia
```

## Detalhes
- **1- EDITAL/** — PDF do edital assinado + ata (quando houver).
- **2- COTAÇÃO/** — planilha mestre replicando o layout (ver `05_LAYOUT_PLANILHA.md`);
  subpastas `COTAÇÃO 1..N` guardam os orçamentos recebidos (PDF/JPG).
- **3- DOCUMENTAÇÃO/** — todos os documentos em "raios"; contém:
  - TXT com **todos os documentos necessários**;
  - **guia** explicando o que é cada documento, pontos de atenção e dicas;
  - subpasta **4- ANEXOS/** com os anexos gerados em Word.
- **LEIA-ME.txt** — guia de uso + passo a passo da metodologia da empresa.

## Customização
- O usuário pode criar **pastas e arquivos customizados**.
- Números e ordem (1-, 2-, 3-, 4-) são o padrão; custom vai sem numeração.

## Convenções de nomes de arquivo (documentos)
Seguir o repo: `NN - NOME DO DOCUMENTO VALIDADE.pdf`
Ex.: `04 - CND FEDERAL 24-01-2027.pdf`, `14 - FGTS 10.11.2026.pdf`.
Isso permite **extrair a validade automaticamente**.
