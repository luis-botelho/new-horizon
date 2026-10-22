import { OperatorBoard } from '@/features/operator-board';
import { FeatureBoundary } from '@/shared/ui/FeatureBoundary';

// `app/` é só roteamento e composição. Regra de negócio mora nas features.
export default function OperatorPage() {
  return (
    <>
      <header style={{ display: 'grid', gap: 'var(--nh-space-1)' }}>
        <h1>Quadro de editais</h1>
        <p style={{ color: 'var(--nh-text-secondary)' }}>Acompanhe o fluxo por etapa com regras e prazos.</p>
      </header>
      <FeatureBoundary feature="operator-board">
        <OperatorBoard />
      </FeatureBoundary>
    </>
  );
}
