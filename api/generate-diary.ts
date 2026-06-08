import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleDiary } from '../server/handlers/diary.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await handleDiary(req.body)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Diary generation failed',
    })
  }
}
