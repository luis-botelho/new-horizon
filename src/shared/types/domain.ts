declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

export type EditalId = Brand<string, 'EditalId'>;
/** Dinheiro SEMPRE em centavos (inteiro). Nunca use float para reais. */
export type Cents = Brand<number, 'Cents'>;

export const KANBAN_STAGES = [
  'radar',
  'analysis',
  'documents',
  'proposal',
  'live',
  'result',
] as const;

export type KanbanStage = (typeof KANBAN_STAGES)[number];
