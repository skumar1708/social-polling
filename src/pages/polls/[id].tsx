import { useRouter } from 'next/router'
import VoteOptions from '../../components/VoteOptions'
import PollDetails from '../../components/PollDetails'
import { useUser } from '../../lib/useUser'
import Link from 'next/link'

export default function PollPage() {
  const router = useRouter()
  const { id } = router.query
  const user = useUser()

  if (!id || typeof id !== 'string') return <p>Loading...</p>
  if (!user) return <p>Loading user...</p>

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard">
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Go to Dashboard
          </button>
        </Link>
        <Link href="/polls/new">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
            Create New Poll
          </button>
        </Link>
      </div>

      <PollDetails pollId={id} />
      <div className="bg-white rounded-lg shadow p-6">
        <VoteOptions pollId={id} userId={user.id} />
      </div>
    </div>
  )
}