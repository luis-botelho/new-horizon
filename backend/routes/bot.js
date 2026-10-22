import { Router } from 'express'

const router = Router()

router.get('/info', (req, res) => {
  res.json({ ok: true, name: 'nh-bot', ws: true })
})

export default router
