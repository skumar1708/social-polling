import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { title, options, user_id } = req.body

    // Validate required fields
    if (!title || !options || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate options array
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'At least 2 options are required' })
    }

    // Create poll in Supabase
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert([
        {
          title,
          user_id,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (pollError) throw pollError

    // Create options for the poll
    const optionsToInsert = options.map((option_text: string) => ({
      poll_id: poll.id,
      option_text,
      votes: 0
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert)

    if (optionsError) throw optionsError

    return res.status(201).json({ poll })
  } catch (error) {
    console.error('Error creating poll:', error)
    return res.status(500).json({ error: 'Error creating poll' })
  }
} 