-- 07 — SCHEMA SUPABASE (MVP 01)
-- Rodar no SQL Editor do Supabase. RLS por usuário. Buckets privados.

-- Extensões
create extension if not exists "uuid-ossp";

-- =========================================================
-- EMPRESAS (proponentes cadastrados)
-- =========================================================
create table if not exists public.empresas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  apelido text not null,
  razao_social text not null,
  cnpj text not null,
  ie text,
  endereco text,
  municipio text,
  uf text,
  cep text,
  telefone text,
  email text,
  representante text,
  cpf text,
  rg text,
  banco text,
  agencia text,
  conta text,
  simples_nacional boolean default true,
  porte text,                        -- ME, EPP, DEMAIS
  contador_nome text,
  contador_crc text,
  timbre_url text,                   -- storage: timbres/{user}/...
  criado_em timestamptz default now()
);

-- =========================================================
-- EDITAIS
-- =========================================================
create table if not exists public.editais (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  numero text,                       -- 90.070/2026
  pncp text,                         -- 552/2026
  uasg text,
  processo text,
  orgao text,
  objeto text,
  tipo_material text,
  sessao timestamptz,
  plataforma text,
  criterio text,
  modo text,
  orcamento text,
  pregoeiro text,
  email_contato text,
  validade_proposta_dias int,
  entrega_dias int,
  pagamento_dias int,
  garantia_meses int,
  pdf_url text,                      -- storage: editais/{user}/...
  status text default 'rascunho',    -- rascunho | revisado | pronto
  criado_em timestamptz default now()
);

-- =========================================================
-- ITENS DO EDITAL
-- =========================================================
create table if not exists public.edital_itens (
  id uuid primary key default uuid_generate_v4(),
  edital_id uuid not null references public.editais(id) on delete cascade,
  item int not null,
  unid text,
  catmat text,
  descricao text not null,
  qtd_total numeric,                 -- SEMPRE = soma do rateio
  rateio jsonb,                      -- {"SDSP":400,"SPDC":3551, ...}
  divergencia boolean default false, -- qt_celula != soma(rateio)
  marca_padrao text,
  criado_em timestamptz default now()
);

-- =========================================================
-- DOCUMENTOS (biblioteca da empresa + validade)
-- =========================================================
create table if not exists public.documentos (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  categoria text,                    -- juridica|economica|fiscal|trabalhista|tecnica
  nome text not null,
  arquivo_url text,                  -- storage: documentos/{empresa}/
  orgao_emissor text,
  validade date,
  criado_em timestamptz default now()
);

-- =========================================================
-- ANEXOS GERADOS
-- =========================================================
create table if not exists public.anexos_gerados (
  id uuid primary key default uuid_generate_v4(),
  edital_id uuid not null references public.editais(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  tipo text not null,                -- II, V, VI, VII, VIII, IX, ME_EPP...
  arquivo_url text,                  -- storage: anexos/{user}/
  status text default 'gerado',      -- gerado | assinado | enviado
  criado_em timestamptz default now()
);

-- =========================================================
-- CHECKLIST DE HABILITAÇÃO
-- =========================================================
create table if not exists public.checklists (
  id uuid primary key default uuid_generate_v4(),
  edital_id uuid not null references public.editais(id) on delete cascade,
  empresa_id uuid references public.empresas(id) on delete cascade,
  item text not null,
  exige boolean default true,
  status text default 'nao_tem',     -- tem | nao_tem | falta | vencido
  observacao text,
  criado_em timestamptz default now()
);

-- =========================================================
-- RLS
-- =========================================================
alter table public.empresas       enable row level security;
alter table public.editais        enable row level security;
alter table public.edital_itens   enable row level security;
alter table public.documentos     enable row level security;
alter table public.anexos_gerados enable row level security;
alter table public.checklists     enable row level security;

create policy "own_empresas"       on public.empresas       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_editais"        on public.editais        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_itens"          on public.edital_itens   for all using (exists (select 1 from public.editais e where e.id = edital_id and e.user_id = auth.uid())) with check (exists (select 1 from public.editais e where e.id = edital_id and e.user_id = auth.uid()));
create policy "own_documentos"     on public.documentos     for all using (exists (select 1 from public.empresas em where em.id = empresa_id and em.user_id = auth.uid())) with check (exists (select 1 from public.empresas em where em.id = empresa_id and em.user_id = auth.uid()));
create policy "own_anexos"         on public.anexos_gerados for all using (exists (select 1 from public.editais e where e.id = edital_id and e.user_id = auth.uid())) with check (exists (select 1 from public.editais e where e.id = edital_id and e.user_id = auth.uid()));
create policy "own_checklists"     on public.checklists     for all using (exists (select 1 from public.editais e where e.id = edital_id and e.user_id = auth.uid())) with check (exists (select 1 from public.editais e where e.id = edital_id and e.user_id = auth.uid()));

-- =========================================================
-- STORAGE (buckets PRIVADOS)
-- =========================================================
insert into storage.buckets (id, name, public) values
  ('timbres',    'timbres',    false),
  ('documentos', 'documentos', false),
  ('editais',    'editais',    false),
  ('anexos',     'anexos',     false)
on conflict (id) do nothing;

-- Acesso ao próprio prefixo (pasta = user_id)
create policy "own_files_read"  on storage.objects for select using (bucket_id in ('timbres','documentos','editais','anexos') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own_files_write" on storage.objects for insert with check (bucket_id in ('timbres','documentos','editais','anexos') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own_files_upd"   on storage.objects for update using (bucket_id in ('timbres','documentos','editais','anexos') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own_files_del"   on storage.objects for delete using (bucket_id in ('timbres','documentos','editais','anexos') and (storage.foldername(name))[1] = auth.uid()::text);
