import { NewEditalFlow } from '@/features/local-export';
import { FeatureBoundary } from '@/shared/ui/FeatureBoundary';

// `app/` é só roteamento e composição. Regra de negócio mora nas features.
export default function NovoEditalPage() {
  return (
    <>
      <h1>Novo edital</h1>
      <p>
        Importe o JSON do edital, revise os itens e exporte a pasta completa no padrão da empresa —
        tudo local, no seu navegador.
      </p>
      <FeatureBoundary feature="local-export">
        <NewEditalFlow />
      </FeatureBoundary>
    </>
  );
}
