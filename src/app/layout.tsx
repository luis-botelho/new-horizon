import type { Metadata } from 'next';
import Link from 'next/link';
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import type { PropsWithChildren } from 'react';
import { env } from '@/shared/lib/env';
import { Providers } from './providers';
import { TranslatorGlobal } from '@/shared/ui/TranslatorGlobal';
import '@/styles/globals.scss';
import styles from './layout.module.scss';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' });
const body = Public_Sans({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'New Horizon',
  description: 'Licitações públicas em linguagem humana.',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            New Horizon
          </Link>
          <nav className={styles.nav} aria-label="Principal">
            <Link href="/onboarding">Começar</Link>
            <Link href="/novo-edital">Novo edital</Link>
            <Link href="/operador">Meus editais</Link>
            {env.investorPool && <Link href="/investidor">Investir</Link>}
          </nav>
        </header>
        <main className={styles.main}>
          <Providers>{children}</Providers>
        </main>
        <TranslatorGlobal />
      </body>
    </html>
  );
}
