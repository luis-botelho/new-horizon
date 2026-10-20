// Configuração do tradutor LLM (cliente-side). Nada vai para o servidor
// por padrão — o usuário aponta endpoint + chave/modelo no próprio navegador.
// Chave fica em localStorage (uso local), nunca commitada.

export interface TranslatorConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  temperature: number;
}

export const DEFAULT_TRANSLATOR_CONFIG: TranslatorConfig = {
  endpoint: 'http://localhost:11434/v1/chat/completions',
  apiKey: '',
  model: 'llama-3.1-8b',
  systemPrompt: `Você é um tradutor especializado em editais de licitação (Pregão Eletrônico, Lei 14.133/2021).

Sua tarefa: traduzir o objeto/descrição oficial do edital para uma versão clara, direta e prática para um operador que vai comprar para o órgão.

Regras:
- Mantenha termos técnicos/licitatórios quando relevantes (pregão, ata de registro de preços, etc.) mas explique em linguagem objetiva.
- Não invente valores, prazos, quantidades ou marcas.
- Não omita obrigações importantes.
- Seja conciso: 1-3 frases. Foque no "o que precisa ser feito/comprado".
- Responda APENAS com a tradução simples, sem introdução, sem explicação.`,
  temperature: 0.2,
};

const STORAGE_KEY = 'new-horizon:translator-config';

export function loadTranslatorConfig(): TranslatorConfig {
  if (typeof window === 'undefined') return DEFAULT_TRANSLATOR_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TRANSLATOR_CONFIG;
    const parsed = JSON.parse(raw) as Partial<TranslatorConfig>;
    return { ...DEFAULT_TRANSLATOR_CONFIG, ...parsed };
  } catch {
    return DEFAULT_TRANSLATOR_CONFIG;
  }
}

export function saveTranslatorConfig(config: TranslatorConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignora quota/exceções de storage
  }
}
