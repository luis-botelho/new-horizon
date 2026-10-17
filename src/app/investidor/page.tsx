import { notFound } from 'next/navigation';
import { RiskNotice } from '@/features/investor-pool';
import { env } from '@/shared/lib/env';

// Atrás de feature flag até haver parecer jurídico (CVM). Ver docs/adr/0002.
export default function InvestorPage() {
  if (!env.investorPool) notFound();

  return (
    <>
      <h1>Pool de Capital</h1>
      <RiskNotice />
      <p>Em construção.</p>
    </>
  );
}
