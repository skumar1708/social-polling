import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { poll_id } = req.query
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('poll_id', poll_id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  } else if (req.method === 'POST') {
    const { poll_id, option_id, user_id } = req.body
    const { data, error } = await supabase.from('votes').insert([{ poll_id, option_id, user_id }])
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json(data)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}