import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, options, user_id } = req.body
    const { data: poll, error: pollError } = await supabase.from('polls').insert([{ title, user_id }]).select().single()
    if (pollError) return res.status(500).json({ error: pollError.message })

    const optionRows = options.map((text: string) => ({ text, poll_id: poll.id }))
    const { error: optionError } = await supabase.from('options').insert(optionRows)
    if (optionError) return res.status(500).json({ error: optionError.message })

    res.status(201).json({ poll })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}