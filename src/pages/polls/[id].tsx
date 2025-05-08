import { useRouter } from 'next/router'
import VoteOptions from '../../components/VoteOptions'
import PollDetails from '../../components/PollDetails'
import PollResults from '../../components/PollResults'
import { useUser } from '../../lib/useUser'

export default function PollPage() {
  const router = useRouter()
  const { id } = router.query
  const user = useUser()

  if (!id || typeof id !== 'string') return <p>Loading...</p>
  if (!user) return <p>Loading user...</p>

  return (
    <div className="max-w-xl mx-auto p-4">
      <PollDetails pollId={id} />
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <VoteOptions pollId={id} userId={user.id} />
      </div>
      <PollResults pollId={id} />
    </div>
  )
}