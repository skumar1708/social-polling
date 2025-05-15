import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import VoteOptions from '../../components/VoteOptions'
import PollDetails from '../../components/PollDetails'
import PollResults from '../../components/PollResults'
import { Poll } from '../../types'
import { useUser } from '../../lib/useUser'

export default function PollPage() {
  const router = useRouter()
  const { id } = router.query
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useUser()

  useEffect(() => {
    if (id) {
      fetchPoll()
    }
  }, [id])

  const fetchPoll = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setPoll(data)
    } catch (error) {
      console.error('Error fetching poll:', error)
      setError('Failed to load poll')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="mt-2 text-gray-600">{error || 'Poll not found'}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please Sign In</h1>
          <p className="mt-2 text-gray-600">You need to be signed in to view this poll.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PollDetails pollId={poll.id} />
      
      {/* Vote Options - Full Width */}
      <div className="w-full">
        <VoteOptions pollId={poll.id} userId={user.id} />
      </div>

      {/* Results Section */}
      <div className="w-full">
        <PollResults pollId={poll.id} />
      </div>
    </div>
  )
}