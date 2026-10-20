'use client';

import { TranslatorPanel } from '@/features/edital-translator/ui/TranslatorPanel';
import { useTranslator } from '@/features/edital-translator/hooks/useTranslator';
import styles from './TranslatorGlobal.module.scss';

export function TranslatorGlobal() {
  const { config, updateConfig } = useTranslator();
  return (
    <div className={styles.global}>
      <TranslatorPanel config={config} onChange={updateConfig} />
    </div>
  );
}
