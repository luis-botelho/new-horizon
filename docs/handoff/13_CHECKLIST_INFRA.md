# 13 — CHECKLIST DE INFRA (Supabase + Vercel, tudo free)

## 1. Supabase (free)
1. Criar conta/projeto em https://supabase.com (região: São Paulo).
2. Guardar `Project URL` e `anon key` (usar variáveis de ambiente).
3. SQL Editor → colar e rodar `07_SCHEMA_SUPABASE.sql`.
4. Authentication → habilitar **Email** (e, se quiser, Magic Link/Google).
5. Storage → conferir buckets `timbres`, `documentos`, `editais`, `anexos`
   (privados) criados pelo script.
6. Auth → Policies: já vêm no script (RLS por `auth.uid()`).

## 2. App local (dev)
```bash
npm create vite@latest app-licitacao -- --template react-ts
cd app-licitacao
npm install @supabase/supabase-js
npm install pdfjs-dist exceljs docx
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Arquivo `.env.local` (NUNCA commitar):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
> A `anon key` é pública por design, mas proteja tudo com RLS. Nunca usar a
> `service_role` no frontend.

## 3. Vercel (free)
1. Subir o repo no GitHub.
2. Importar na Vercel; framework = Vite.
3. Adicionar as variáveis `VITE_SUPABASE_*` nas Environment Variables.
4. Deploy.

## 4. File System Access API (escrever no PC)
- Requer Chromium (Chrome/Edge) e conexão segura (https ou localhost).
- Fluxo: `showDirectoryPicker()` → criar subpastas/arquivos com
  `getDirectoryHandle` / `createWritable`.
- Guardar o `FileSystemDirectoryHandle` para reescrever sem pedir permissão de
  novo (dentro da sessão).
- Não funciona no Firefox/Safari; prever mensagem clara + plano B (download ZIP).

## 5. Segurança
- RLS em todas as tabelas; buckets privados + signed URLs.
- Não logar dados sensíveis (CNPJ, certidões).
- Dados sensíveis preferencialmente ficam no PC do usuário; no Supabase só o
  necessário. Nota LGPD.
- Separar A.Luz e JLV por `empresa_id`.

## 6. Variáveis e segredos
- `.env.local` no `.gitignore`.
- Nunca hardcoded no código-fonte.
