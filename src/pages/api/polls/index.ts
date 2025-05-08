import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res?.status(405)?.json({ error: 'Method not allowed' })
  }

  try {
    const { title, options, user_id } = req.body

    // Validate required fields
    if (!title?.trim()) {
      return res?.status(400)?.json({ error: 'Poll title is required' })
    }

    if (!user_id) {
      return res?.status(400)?.json({ error: 'User ID is required' })
    }

    // Validate options array
    if (!Array.isArray(options)) {
      return res?.status(400)?.json({ error: 'Options must be an array' })
    }

    const validOptions = options.filter(opt => opt?.trim())
    if (validOptions.length < 2) {
      return res?.status(400)?.json({ error: 'At least 2 valid options are required' })
    }

    // Create poll in Supabase
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert([
        {
          title: title.trim(),
          user_id,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return res?.status(500)?.json({ error: 'Failed to create poll' })
    }

    // Create options for the poll
    const optionsToInsert = validOptions.map((option_text: string) => ({
      poll_id: poll.id,
      option_text: option_text.trim(),
      votes: 0
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert)

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      // Clean up the poll if options creation fails
      await supabase.from('polls').delete().eq('id', poll.id)
      return res?.status(500)?.json({ error: 'Failed to create poll options' })
    }

    return res?.status(201)?.json({ poll })
  } catch (error) {
    console.error('Error creating poll:', error)
    return res?.status(500)?.json({ error: 'Internal server error' })
  }
} 