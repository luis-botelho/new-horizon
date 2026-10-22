import { env } from '../config/env.js'

export async function chatCompletion({ messages, model, temperature, stream = false } = {}) {
  const baseUrl = env.llm.baseUrl.replace(/\/$/, '')
  const url = `${baseUrl}/chat/completions`
  const headers = {
    'Content-Type': 'application/json'
  }
  if (env.llm.apiKey) headers['Authorization'] = `Bearer ${env.llm.apiKey}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), env.llm.timeoutMs)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || env.llm.model,
        temperature: temperature ?? env.llm.temperature,
        messages,
        stream
      }),
      signal: controller.signal
    })

    const text = await res.text()
    if (!res.ok) {
      throw new Error(`LLM error ${res.status}: ${text}`)
    }
    const json = JSON.parse(text)
    const content = json?.choices?.[0]?.message?.content ?? json?.output_text ?? ''
    return { content: String(content).trim(), raw: json }
  } finally {
    clearTimeout(timeout)
  }
}

export async function translateEdialObject(officialText) {
  if (!officialText?.trim()) return ''
  const messages = [
    {
      role: 'system',
      content: 'Você é um tradutor de editais públicos (Lei 14.133/2021). Traduza o objeto oficial para linguagem clara e objetiva para operador. Não invente valores/prazos/quantidades. Responda APENAS com a versão simples.'
    },
    { role: 'user', content: officialText }
  ]
  const { content } = await chatCompletion({ messages })
  return content
}
