import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface PollOption {
  id: string
  poll_id: string
  option_text: string
  votes: number
}

interface Vote {
  id: string
  poll_id: string
  option_id: string
  user_id: string
}

export default function VoteOptions({ pollId, userId }: { pollId: string; userId: string }) {
  const [options, setOptions] = useState<PollOption[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [userVote, setUserVote] = useState<Vote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchOptionsAndVote = async () => {
      try {
        // Fetch poll options
        const { data: optionsData, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', pollId)
          .order('created_at', { ascending: true })

        if (optionsError) throw optionsError
        setOptions(optionsData || [])

        // Fetch user's vote if exists
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .select('*')
          .eq('poll_id', pollId)
          .eq('user_id', userId)
          .maybeSingle()

        if (voteError && voteError.code !== 'PGRST116') throw voteError
        setUserVote(voteData)
        if (voteData) setSelectedOption(voteData.option_id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching options')
      } finally {
        setLoading(false)
      }
    }

    if (pollId && userId) {
      fetchOptionsAndVote()
    }
  }, [pollId, userId])

  const handleVote = async () => {
    if (!selectedOption) return

    try {
      setSubmitting(true)
      setError('')

      // If user already voted, update their vote
      if (userVote) {
        // Decrement vote count for previous option
        const { error: decrementError } = await supabase.rpc('decrement_vote_count', {
          option_id: userVote.option_id
        })
        if (decrementError) throw decrementError

        // Update vote record
        const { error: updateError } = await supabase
          .from('votes')
          .update({ option_id: selectedOption })
          .eq('id', userVote.id)

        if (updateError) throw updateError
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert([
            {
              poll_id: pollId,
              option_id: selectedOption,
              user_id: userId
            }
          ])

        if (insertError) throw insertError
      }

      // Increment vote count for new option
      const { error: incrementError } = await supabase.rpc('increment_vote_count', {
        option_id: selectedOption
      })
      if (incrementError) throw incrementError

      // Update local state
      setUserVote({ id: 'temp', poll_id: pollId, option_id: selectedOption, user_id: userId })
      
      // Refresh options to show updated vote counts
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('created_at', { ascending: true })

      if (optionsError) throw optionsError
      setOptions(optionsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting vote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-4">Loading options...</div>
  if (error) return <div className="text-red-500 py-4">{error}</div>

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {options.map(option => (
          <div
            key={option.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedOption === option.id
                ? 'border-blue-500 bg-blue-50'
                : 'hover:border-gray-400'
            }`}
            onClick={() => !userVote && setSelectedOption(option.id)}
          >
            <div className="flex justify-between items-center">
              <span>{option.option_text}</span>
              <span className="text-gray-600">{option.votes} votes</span>
            </div>
          </div>
        ))}
      </div>

      {!userVote && (
        <button
          onClick={handleVote}
          disabled={!selectedOption || submitting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {submitting ? 'Submitting...' : 'Submit Vote'}
        </button>
      )}

      {userVote && (
        <p className="text-center text-green-600">
          You have already voted on this poll
        </p>
      )}
    </div>
  )
}