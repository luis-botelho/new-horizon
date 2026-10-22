import { WebSocketServer } from 'ws'
import { translateEdialObject } from '../services/llm.js'

export function setupWebSocket(server, path = '/ws') {
  const wss = new WebSocketServer({ server, path })

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'connected', msg: 'New Horizon bot conectado' }))

    ws.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString())
        if (data.type === 'ping') {
          return ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }))
        }
        if (data.type === 'translate') {
          const content = await translateEdialObject(data.text || '')
          return ws.send(JSON.stringify({ type: 'translate_result', content, id: data.id }))
        }
        ws.send(JSON.stringify({ type: 'error', msg: 'tipo não suportado' }))
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', msg: err.message }))
      }
    })

    ws.on('close', () => {})
  })

  return wss
}
