import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

export const env = {
  port: Number(process.env.PORT || 4000),
  host: process.env.HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  llm: {
    provider: process.env.LLM_PROVIDER || 'ollama',
    baseUrl: process.env.LLM_BASE_URL || 'http://localhost:11434/v1',
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'llama-3.1-8b',
    temperature: Number(process.env.LLM_TEMPERATURE || 0.2),
    timeoutMs: Number(process.env.LLM_TIMEOUT_MS || 60000)
  },
  wsPath: process.env.WS_PATH || '/ws'
}
