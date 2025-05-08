import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

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
  const [votes, setVotes] = useState<Vote[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [userVote, setUserVote] = useState<Vote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let optionsChannel: RealtimeChannel
    let votesChannel: RealtimeChannel

    const setupRealtimeSubscriptions = () => {
      console.log('Setting up realtime subscriptions for poll:', pollId)
      
      // Subscribe to changes in poll_options
      optionsChannel = supabase
        .channel('poll_options_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'poll_options',
            filter: `poll_id=eq.${pollId}`
          },
          (payload) => {
            console.log('Received poll_options change:', payload)
            // Immediately update the options
            setOptions(currentOptions => {
              const newOptions = [...currentOptions]
              const newData = payload.new as PollOption
              const index = newOptions.findIndex(opt => opt.id === newData.id)
              
              if (index !== -1) {
                // Update existing option
                newOptions[index] = { ...newOptions[index], ...newData }
              } else {
                // Add new option
                newOptions.push(newData)
              }
              
              return newOptions
            })
          }
        )
        .subscribe((status) => {
          console.log('Poll options subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to poll_options changes')
          }
        })

      // Subscribe to changes in votes
      votesChannel = supabase
        .channel('votes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'votes',
            filter: `poll_id=eq.${pollId}`
          },
          (payload) => {
            console.log('Received votes change:', payload)
            // If the change is related to the current user's vote
            if (payload.new && (payload.new as Vote).user_id === userId) {
              console.log('Updating user vote:', payload.new)
              setUserVote(payload.new as Vote)
              setSelectedOption((payload.new as Vote).option_id)
            }
            // Refresh votes to update counts
            fetchVotes()
          }
        )
        .subscribe((status) => {
          console.log('Votes subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to votes changes')
          }
        })
    }

    const fetchVotes = async () => {
      try {
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('poll_id', pollId)

        if (votesError) throw votesError
        setVotes(votesData || [])
      } catch (err) {
        console.error('Error fetching votes:', err)
      }
    }

    const fetchOptionsAndVote = async () => {
      try {
        console.log('Fetching initial data...')
        // Fetch poll options
        const { data: optionsData, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', pollId)
          .order('created_at', { ascending: true })

        if (optionsError) {
          console.error('Error fetching options:', optionsError)
          throw optionsError
        }
        console.log('Fetched initial options:', optionsData)
        setOptions(optionsData || [])

        // Fetch all votes
        await fetchVotes()

        // Fetch user's vote if exists
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .select('*')
          .eq('poll_id', pollId)
          .eq('user_id', userId)
          .maybeSingle()

        if (voteError && voteError.code !== 'PGRST116') {
          console.error('Error fetching vote:', voteError)
          throw voteError
        }
        console.log('Fetched user vote:', voteData)
        setUserVote(voteData)
        if (voteData) setSelectedOption(voteData.option_id)
      } catch (err) {
        console.error('Error in fetchOptionsAndVote:', err)
        setError(err instanceof Error ? err.message : 'Error fetching options')
      } finally {
        setLoading(false)
      }
    }

    if (pollId && userId) {
      fetchOptionsAndVote()
      setupRealtimeSubscriptions()
    }

    // Cleanup subscriptions when component unmounts
    return () => {
      console.log('Cleaning up realtime subscriptions')
      if (optionsChannel) {
        optionsChannel.unsubscribe()
      }
      if (votesChannel) {
        votesChannel.unsubscribe()
      }
    }
  }, [pollId, userId])

  const handleVote = async () => {
    if (!selectedOption) return

    try {
      setSubmitting(true)
      setError('')

      // If user already voted, update their vote
      if (userVote) {
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

      // Update local state
      setUserVote({ id: 'temp', poll_id: pollId, option_id: selectedOption, user_id: userId })
      
      // Refresh votes to show updated counts
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .eq('poll_id', pollId)

      if (votesError) throw votesError
      setVotes(votesData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting vote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-4">Loading options...</div>
  if (error) return <div className="text-red-500 py-4">{error}</div>

  // Calculate vote counts for each option
  const optionVotes = options.map(option => ({
    ...option,
    votes: votes.filter(vote => vote.option_id === option.id).length
  }))

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {optionVotes.map(option => (
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