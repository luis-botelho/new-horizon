import { useEffect, useState } from 'react';
import { translateOfficialText } from '../lib/translate';
import type { TranslatorConfig } from '../lib/config';

export function useAutoTranslate(config: TranslatorConfig, official: string) {
  const [simple, setSimple] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!official.trim()) {
      setSimple('');
      setError(null);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      translateOfficialText(config, official)
        .then((result) => {
          if (!cancelled) setSimple(result || official.slice(0, 160));
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [config, official]);

  return { simple, loading, error };
}
