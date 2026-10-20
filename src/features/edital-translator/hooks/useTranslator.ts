'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadTranslatorConfig, saveTranslatorConfig, type TranslatorConfig } from '../lib/config';
import { translateOfficialText } from '../lib/translate';

export function useTranslator() {
  const [config, setConfig] = useState<TranslatorConfig>(loadTranslatorConfig());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveTranslatorConfig(config);
  }, [config]);

  const updateConfig = useCallback((partial: Partial<TranslatorConfig>) => {
    setConfig((current) => ({ ...current, ...partial }));
  }, []);

  const translate = useCallback(
    async (official: string): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const result = await translateOfficialText(config, official);
        return result;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [config],
  );

  return { config, updateConfig, translate, loading, error };
}
