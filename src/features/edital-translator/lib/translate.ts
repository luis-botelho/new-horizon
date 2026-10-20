// Chama um endpoint OpenAI-compatible (OpenAI, LiteLLM, Ollama v0.1.34+ com /v1)
// enviando apenas o texto oficial. Retorna a tradução simples (string pura).
// Função pura/client-side, não envia para backend próprio.

import type { TranslatorConfig } from './config';

export async function translateOfficialText(config: TranslatorConfig, official: string): Promise<string> {
  if (!official.trim()) return '';
  if (!config.endpoint.trim()) throw new Error('Endpoint não configurado');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey.trim()) headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;

  const body = {
    model: config.model.trim() || 'llama-3.1-8b',
    temperature: config.temperature ?? 0.2,
    messages: [
      { role: 'system', content: config.systemPrompt },
      { role: 'user', content: official },
    ],
    stream: false,
  };

  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Falha na tradução (${res.status}): ${text}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? json?.output_text ?? '';
  return String(content).trim();
}
