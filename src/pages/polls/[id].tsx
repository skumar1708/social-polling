import { useRouter } from 'next/router'
import VoteOptions from '../../components/VoteOptions'
import PollDetails from '../../components/PollDetails'
import { useUser } from '../../lib/useUser'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/solid'

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
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
            Go to Dashboard
          </button>
        </Link>
        <Link href="/polls/new">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Poll
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