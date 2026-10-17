// Regra de ouro do rateio (docs/handoff/05_LAYOUT_PLANILHA.md):
// a quantidade efetiva de um item NUNCA vem da célula isolada `QT` — vem da
// SOMA do rateio por secretaria. Foi a causa de um bug real: célula "3.951"
// (separador de milhar) lida como decimal, quando o rateio somava 3951.
import type { EditalItem } from '@/shared/types/edital';

export type QuantitySource = 'rateio' | 'cell';

export interface ResolvedQuantity {
  /** Quantidade efetiva a usar na planilha, pasta e proposta. */
  quantity: number;
  /** De onde o número veio: soma do rateio ou fallback na célula. */
  source: QuantitySource;
  /** true quando a célula isolada diverge da soma (ou o rateio está vazio). */
  divergence: boolean;
  /** Soma bruta do rateio por secretaria (0 quando não preenchido). */
  rateioSum: number;
}

/**
 * Resolve a quantidade de um item a partir do rateio por secretaria.
 * Função pura: mesma entrada, mesmo resultado; sem efeitos colaterais.
 */
export function resolveItemQuantity(item: EditalItem): ResolvedQuantity {
  const rateioSum = item.qtd_sdsp + item.qtd_spdc + item.qtd_outras;

  if (rateioSum > 0) {
    return {
      quantity: rateioSum,
      source: 'rateio',
      divergence: item.qt_celula !== rateioSum,
      rateioSum,
    };
  }

  // Rateio não preenchido: cai na quantidade já resolvida da origem e
  // sinaliza divergência para revisão manual (não dá para conferir).
  return {
    quantity: item.qt,
    source: 'cell',
    divergence: true,
    rateioSum,
  };
}
