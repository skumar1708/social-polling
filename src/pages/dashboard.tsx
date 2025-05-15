// pages/dashboard.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { TrashIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/hooks/useAuth'
import Head from 'next/head'

interface Poll {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  user_id: string;
}

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingPollId, setDeletingPollId] = useState<number | null>(null)

  useEffect(() => {
    fetchPolls()
  }, [])

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPolls(data || [])
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePoll = async (pollId: number) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingPollId(pollId)
      const { error } = await supabase.rpc('delete_poll', { 
        p_id: pollId 
      })
      
      if (error) throw error
      
      // Update local state
      setPolls(polls.filter(poll => poll.id !== pollId))
    } catch (error) {
      console.error('Error deleting poll:', error)
      alert('Failed to delete poll. Please try again.')
    } finally {
      setDeletingPollId(null)
    }
  }

  const isPollOwner = (pollUserId: string) => {
    return user?.id === pollUserId
  }

  return (
    <>
      <Head>
        <title>My Polls | Social Polling</title>
        <meta name="description" content="View and manage your polls" />
      </Head>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Polls</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No polls</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new poll.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate" title={poll.title}>
                        {poll.title}
                      </h3>
                      {poll.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{poll.description}</p>
                      )}
                    </div>
                    {isPollOwner(poll.user_id) && (
                      <button
                        onClick={() => handleDeletePoll(poll.id)}
                        disabled={deletingPollId === poll.id}
                        className="ml-4 p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full"
                        title="Delete poll"
                      >
                        {deletingPollId === poll.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => router.push(`/polls/${poll.id}`)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View Results →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
