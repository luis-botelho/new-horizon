import { Router } from 'express'
import { translateEdialObject } from '../services/llm.js'

const router = Router()

router.post('/translate', async (req, res) => {
  try {
    const { text, messages } = req.body || {}
    if (messages?.length) {
      const { chatCompletion } = await import('../services/llm.js')
      const result = await chatCompletion({ messages })
      return res.json({ ok: true, content: result.content })
    }
    if (!text?.trim()) return res.status(400).json({ ok: false, error: 'text required' })
    const content = await translateEdialObject(text)
    res.json({ ok: true, content })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

export default router
