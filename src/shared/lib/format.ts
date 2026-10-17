import type { Cents } from '@/shared/types/domain';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatBRL = (value: Cents): string => brl.format(value / 100);
