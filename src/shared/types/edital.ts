// Contrato do edital parseado — espelho de docs/handoff/06_CONTRATO_DADOS_edital.json.
// Fonte única de verdade para importação, geração de pastas e planilha mestre.
// Chaves do JSON são em português (contrato de dados legado do fluxo da empresa);
// identificadores em inglês conforme regra do projeto.
import { z } from 'zod';

const nonEmpty = (message: string): z.ZodString => z.string().trim().min(1, message);

const dayCount = (message: string): z.ZodNumber =>
  z.number().int().positive({ message });

/** Valida CNPJ pelo algoritmo oficial dos dígitos verificadores (mod 11). */
function isValidCnpj(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;

  const compute = (base: string, weights: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, digit, index) => acc + Number(digit) * (weights[index] ?? 0), 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const first = compute(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = compute(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digits.endsWith(`${first}${second}`);
}

/** Cabeçalho do edital: identificação do certame e prazos contratuais. */
export const editalMetaSchema = z.object({
  pregao: nonEmpty('pregão é obrigatório'),
  pncp: z.string().default(''),
  processo_sei: z.string().default(''),
  uasg: z.string().default(''),
  orgao: nonEmpty('órgão é obrigatório'),
  objeto: nonEmpty('objeto é obrigatório'),
  // Data/hora local da sessão no formato ISO sem fuso (ex.: "2026-10-16T10:00").
  sessao: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, 'sessão deve ser data/hora ISO (AAAA-MM-DDTHH:MM)'),
  plataforma: z.string().default(''),
  criterio: z.string().default(''),
  modo: z.string().default(''),
  orcamento: z.string().default(''),
  validade_proposta_dias: dayCount('validade da proposta deve ser um número de dias'),
  entrega_dias: dayCount('prazo de entrega deve ser um número de dias'),
  pagamento_dias: dayCount('prazo de pagamento deve ser um número de dias'),
  garantia_meses: dayCount('garantia deve ser um número de meses'),
  observacoes: z.string().default(''),
});

/** Empresa proponente (cada proposta é gerada por empresa). */
export const proponentCompanySchema = z
  .object({
    apelido: nonEmpty('apelido da empresa é obrigatório'),
    razao_social: nonEmpty('razão social é obrigatória'),
    cnpj: z
      .string()
      .trim()
      .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve seguir o formato 00.000.000/0000-00')
      .refine(isValidCnpj, 'CNPJ inválido (dígitos verificadores não conferem)'),
    ie: z.string().default(''),
    endereco: z.string().default(''),
    municipio: z.string().default(''),
    uf: z.string().regex(/^[A-Za-z]{2}$/, 'UF deve ter 2 letras'),
    cep: z.string().default(''),
    telefone: z.string().default(''),
    email: z.string().default(''),
    representante: z.string().default(''),
    cpf: z.string().default(''),
    rg: z.string().default(''),
    banco: z.string().default(''),
    simples_nacional: z.boolean(),
    // Aba da planilha em que a proposta desta empresa será gerada.
    porta: nonEmpty('porta (aba da proposta) é obrigatória'),
    observacoes: z.string().default(''),
  })
  .superRefine((company, ctx) => {
    if (company.email.length > 0 && !company.email.includes('@')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'e-mail inválido',
        path: ['email'],
      });
    }
  });

/**
 * Item do edital com rateio por secretaria.
 * Regra de ouro (docs/handoff/05): a quantidade efetiva é a SOMA do rateio
 * (qtd_sdsp + qtd_spdc + qtd_outras), nunca a célula isolada `qt_celula`.
 * `qt` é a quantidade já resolvida na origem; `divergencia` marca quando a
 * célula isolada diverge do rateio (bug real: "3.951" lido como decimal).
 */
export const editalItemSchema = z.object({
  item: z.number().int().positive('número do item deve ser inteiro positivo'),
  qt: z.number().positive('quantidade deve ser maior que zero'),
  qt_celula: z.number().min(0, 'quantidade da célula não pode ser negativa'),
  unid: nonEmpty('unidade é obrigatória'),
  grupo: z.string().default(''),
  qtd_sdsp: z.number().min(0).default(0),
  qtd_spdc: z.number().min(0).default(0),
  qtd_outras: z.number().min(0).default(0),
  divergencia: z.boolean().default(false),
  descricao: nonEmpty('descrição do item é obrigatória'),
});

export const editalParsedSchema = z
  .object({
    edital: editalMetaSchema,
    empresas: z.array(proponentCompanySchema).min(1, 'informe ao menos uma empresa proponente'),
    itens: z.array(editalItemSchema).min(1, 'o edital precisa de ao menos um item'),
  })
  .superRefine((parsed, ctx) => {
    const seen = new Set<number>();
    parsed.itens.forEach((item, index) => {
      if (seen.has(item.item)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `item ${item.item} duplicado`,
          path: ['itens', index, 'item'],
        });
      }
      seen.add(item.item);
    });
  });

export type EditalMeta = z.infer<typeof editalMetaSchema>;
export type ProponentCompany = z.infer<typeof proponentCompanySchema>;
export type EditalItem = z.infer<typeof editalItemSchema>;
export type EditalParsed = z.infer<typeof editalParsedSchema>;
