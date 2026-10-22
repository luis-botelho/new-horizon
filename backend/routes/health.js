import { Router } from 'express'
import { env } from '../config/env.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'new-horizon-backend', provider: env.llm.provider, model: env.llm.model })
})

export default router
