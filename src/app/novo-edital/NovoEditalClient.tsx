'use client';

import { PdfImportSlot } from '@/features/edital-parser';
import { NewEditalFlow } from '@/features/local-export';
import { COMPANIES_SEED } from '@/shared/data/companiesSeed';
import type { EditalDraft } from '@/shared/types/edital';

// Composição das duas features: o slot entrega o texto parseado e aqui o
// rascunho é completado com o seed de empresas (o PDF não traz propostantes).
// `app/` é o único lugar que pode cruzar features — nenhuma importa a outra.
export function NovoEditalClient() {
  return (
    <NewEditalFlow
      renderImportSlot={({ onImport }) => (
        <PdfImportSlot
          onParsed={(parsed) => {
            const draft: EditalDraft = {
              meta: parsed.meta,
              empresas: COMPANIES_SEED,
              itens: parsed.itens,
              issues: parsed.issues,
            };
            onImport(draft);
          }}
        />
      )}
    />
  );
}
