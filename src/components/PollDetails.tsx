import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Poll {
  id: string
  title: string
  created_at: string
  user_id: string
}

interface PollOption {
  id: string
  poll_id: string
  option_text: string
  votes: number
}

export default function PollDetails({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [, setOptions] = useState<PollOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPollDetails = async () => {
      try {
        // Fetch poll details
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('id', pollId)
          .single()

        if (pollError) throw pollError
        setPoll(pollData)

        // Fetch poll options
        const { data: optionsData, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', pollId)
          .order('created_at', { ascending: true })

        if (optionsError) throw optionsError
        setOptions(optionsData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching poll details')
      } finally {
        setLoading(false)
      }
    }

    if (pollId) {
      fetchPollDetails()
    }
  }, [pollId])

  if (loading) return <div className="text-center py-4">Loading poll details...</div>
  if (error) return <div className="text-red-500 py-4">{error}</div>
  if (!poll) return <div className="text-center py-4">Poll not found</div>

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-2">{poll.title}</h1>
      <p className="text-gray-600 text-sm">
        Created on {new Date(poll.created_at).toLocaleDateString()}
      </p>
    </div>
  )
} 