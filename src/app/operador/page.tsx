import { OperatorBoard } from '@/features/operator-board';
import { FeatureBoundary } from '@/shared/ui/FeatureBoundary';

// `app/` é só roteamento e composição. Regra de negócio mora nas features.
export default function OperatorPage() {
  return (
    <>
      <h1>Meus editais</h1>
      <FeatureBoundary feature="operator-board">
        <OperatorBoard />
      </FeatureBoundary>
    </>
  );
}
