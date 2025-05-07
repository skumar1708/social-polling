// pages/dashboard.tsx
import { useEffect, useState } from 'react'
import { useUser } from '../lib/useUser'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { Poll } from '../types'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const user = useUser()
  const router = useRouter()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  const handleCreatePoll = () => {
    router.push('/polls/new')
  }

  useEffect(() => {
    if (!user) return
    const fetchPolls = async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) setPolls(data || [])
      setLoading(false)
    }
    fetchPolls()
  }, [user])

  if (!user) return <p>Loading user...</p>
  if (loading) return <p>Loading polls...</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Polls</h1>
        <div className="space-x-4">
          {polls.length > 0 && (
            <button
              onClick={handleCreatePoll}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Create Poll
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      {polls.length === 0 ? (
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">You haven&apos;t created any polls yet.</p>
          <button
            onClick={handleCreatePoll}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg"
          >
            Create Your First Poll
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {polls.map(poll => (
            <li key={poll.id} className="border p-4 rounded">
              <h2 className="text-lg font-semibold">{poll.title}</h2>
              <div className="mt-2 space-x-2">
                <Link href={`/polls/${poll.id}`} className="text-blue-600 hover:underline">
                  View & Vote
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
