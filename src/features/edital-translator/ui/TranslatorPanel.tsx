'use client';

import { useState } from 'react';
import type { TranslatorConfig } from '../lib/config';
import styles from './TranslatorPanel.module.scss';

interface TranslatorPanelProps {
  config: TranslatorConfig;
  onChange: (partial: Partial<TranslatorConfig>) => void;
}

export function TranslatorPanel({ config, onChange }: TranslatorPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <details className={styles.panel} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className={styles.summary}>Configurar tradutor LLM (cliente-side)</summary>
      <div className={styles.body}>
        <p className={styles.hint}>
          Endpoint OpenAI-compatible (Ollama, LiteLLM, OpenRouter, etc.). A chave e o texto oficial
          ficam só no seu navegador.
        </p>
        <label className={styles.field}>
          Endpoint
          <input
            value={config.endpoint}
            onChange={(e) => onChange({ endpoint: e.target.value })}
            placeholder="http://localhost:11434/v1/chat/completions"
          />
        </label>
        <label className={styles.field}>
          Chave API (opcional)
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => onChange({ apiKey: e.target.value })}
            placeholder="sk-..."
            autoComplete="off"
          />
        </label>
        <label className={styles.field}>
          Modelo
          <input value={config.model} onChange={(e) => onChange({ model: e.target.value })} />
        </label>
        <label className={styles.field}>
          Temperatura
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={config.temperature}
            onChange={(e) => onChange({ temperature: Number(e.target.value) })}
          />
        </label>
        <label className={styles.field}>
          System prompt
          <textarea
            rows={6}
            value={config.systemPrompt}
            onChange={(e) => onChange({ systemPrompt: e.target.value })}
          />
        </label>
      </div>
    </details>
  );
}
