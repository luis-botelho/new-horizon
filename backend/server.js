import express from 'express'
import cors from 'cors'
import http from 'http'
import { env } from './config/env.js'
import health from './routes/health.js'
import translate from './routes/translate.js'
import bot from './routes/bot.js'
import { setupWebSocket } from './ws/bot.js'

const app = express()
app.use(cors({ origin: env.corsOrigin }))
app.use(express.json({ limit: '1mb' }))

app.use('/api', health)
app.use('/api', translate)
app.use('/api/bot', bot)

app.get('/', (req, res) => res.json({ ok: true, name: 'new-horizon-backend' }))

const server = http.createServer(app)
setupWebSocket(server, env.wsPath)

server.listen(env.port, env.host, () => {
  console.log(`NH backend on http://${env.host}:${env.port} ws:${env.wsPath}`)
})
