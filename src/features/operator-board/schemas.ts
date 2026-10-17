import { z } from 'zod';
import { KANBAN_STAGES, type Cents, type EditalId } from '@/shared/types/domain';

/** Validação na fronteira: tipo TypeScript não existe em runtime. */
export const editalSchema = z.object({
  id: z.string().min(1).transform((v) => v as EditalId),
  orgao: z.string(),
  municipio: z.string(),
  uf: z.string().length(2),
  objetoOficial: z.string(),
  objetoSimples: z.string(),
  valorEstimadoCentavos: z.number().int().nonnegative().transform((v) => v as Cents),
  publicadoEm: z.coerce.date(),
  dataLimite: z.coerce.date(),
  stage: z.enum(KANBAN_STAGES),
  documentos: z.object({
    total: z.number().int().nonnegative(),
    prontos: z.number().int().nonnegative(),
  }),
});

export type Edital = z.infer<typeof editalSchema>;
export const editaisSchema = z.array(editalSchema);
