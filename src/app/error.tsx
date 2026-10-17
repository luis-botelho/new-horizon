'use client';

import { Button } from '@/shared/ui/Button';

// Boundary de rota do Next: último recurso. Os boundaries por feature ficam mais perto do erro.
export default function RouteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert">
      <h1>Algo deu errado por aqui</h1>
      <p>Não conseguimos abrir esta página.</p>
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  );
}
