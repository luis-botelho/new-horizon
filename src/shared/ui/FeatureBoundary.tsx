'use client';

import type { PropsWithChildren } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Button } from './Button';
import styles from './FeatureBoundary.module.scss';

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className={styles.fallback}>
      <p>Não conseguimos carregar esta parte.</p>
      <Button variant="ghost" onClick={resetErrorBoundary}>
        Tentar de novo
      </Button>
      {process.env.NODE_ENV === 'development' && <pre>{String(error)}</pre>}
    </div>
  );
}

/** Um boundary por feature: se o Kanban quebrar, o resto da página continua de pé. */
export function FeatureBoundary({ children, feature }: PropsWithChildren<{ feature: string }>) {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, info) => {
        // Ponto de integração com Sentry/observabilidade, com a tag da feature.
        console.error(`[${feature}]`, error, info.componentStack);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
