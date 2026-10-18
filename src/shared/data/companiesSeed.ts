// Espelho TS de docs/handoff/09_EMPRESAS_SEED.json — fonte runtime do seed de
// empresas proponentes. O edital (PDF) não traz empresas: quem importa por PDF
// recebe este seed e completa os campos vazios no app.
//
// Versão saneada (LGPD): CPF, RG, representante, telefone, e-mail e dados
// bancários vazios no documento de origem — preencher em ambiente local.
// `porta` (aba da proposta) não existe no JSON de origem: é derivada abaixo.
import type { ProponentCompany } from '@/shared/types/edital';

/**
 * Contrato da empresa + chaves extras do JSON saneado que só existem no seed.
 * O Zod (`editalParsedSchema`) remove as extras na validação do export — aqui
 * elas ficam para não perder a informação no espelho do documento.
 */
export type CompanySeed = ProponentCompany & {
  agencia: string;
  conta: string;
  porte: string;
  porte_observacao: string;
  timbre_url: string;
};

const SEED_COMPANIES: CompanySeed[] = [
  {
    apelido: 'A.Luz',
    razao_social: 'ANGRA LUZ COMERCIO E DISTRIBUIDORA DE MATERIAIS ELETRICOS LTDA',
    cnpj: '13.652.354/0001-62',
    ie: '11.276.504',
    endereco: 'Rua Francelino Alves de Lima, n 101 - Nova Angra',
    municipio: 'Angra dos Reis',
    uf: 'RJ',
    cep: '',
    telefone: '',
    email: '',
    representante: '',
    cpf: '',
    rg: '',
    banco: '',
    agencia: '',
    conta: '',
    simples_nacional: true,
    porta: '',
    observacoes: '',
    porte: 'DEMAIS',
    porte_observacao: 'Optante do Simples Nacional.',
    timbre_url: '',
  },
  {
    apelido: 'JLV',
    razao_social: 'JLV COMERCIO PARA CONSTRUCAO LTDA',
    cnpj: '43.394.424/0001-90',
    ie: '',
    endereco: 'Av. Itaguai, 224 - Nova Angra (Cunhambebe)',
    municipio: 'Angra dos Reis',
    uf: 'RJ',
    cep: '23.933-115',
    telefone: '',
    email: '',
    representante: '',
    cpf: '',
    rg: '',
    banco: '',
    agencia: '',
    conta: '',
    simples_nacional: true,
    porta: '',
    observacoes: '',
    porte: 'EPP',
    porte_observacao: 'Grupo CMV Eletrica e Construcao. EPP (LC 123/2006).',
    timbre_url: '',
  },
];

/**
 * Seed pronto para o fluxo, com `porta` derivada pela posição: a primeira
 * empresa é a aba `Proposta` base e as demais viram `Readequada {apelido}`
 * (docs/handoff/10_MODUS_OPERANDI, passo 7).
 */
export const COMPANIES_SEED: CompanySeed[] = SEED_COMPANIES.map((company, index) => ({
  ...company,
  porta: index === 0 ? 'Proposta' : `Readequada ${company.apelido}`,
}));
