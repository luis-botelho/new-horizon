import { NovoEditalClient } from './NovoEditalClient';
import { FeatureBoundary } from '@/shared/ui/FeatureBoundary';

// `app/` é só roteamento e composição. Regra de negócio mora nas features.
export default function NovoEditalPage() {
  return (
    <>
      <h1>Novo edital</h1>
      <p>
        Leia o PDF do edital (ou cole o JSON), revise os dados e exporte a pasta completa no padrão
        da empresa — tudo local, no seu navegador.
      </p>
      <FeatureBoundary feature="local-export">
        <NovoEditalClient />
      </FeatureBoundary>
    </>
  );
}
