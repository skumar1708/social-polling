import PollForm from '../../components/PollForm'
import { useUser } from '../../lib/useUser'

export default function NewPoll() {
  const user = useUser()
  if (!user) return <p>Loading...</p>
  return <PollForm userId={user?.id} />
}