import { useRouter } from 'next/router'
import PollForm from '../../components/PollForm'
import { useUser } from '../../lib/useUser'
import { useState } from 'react'

export default function NewPoll() {
  const router = useRouter()
  const user = useUser()
  const [loading, setLoading] = useState(false)

  if (!user) return <p>Loading...</p>

  const handleSubmit = async (data: { title: string; options: string[] }) => {
    try {
      setLoading(true)
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title.trim(),
          options: data.options.map(opt => opt.trim()),
          user_id: user.id
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create poll')
      }

      const { poll } = await res.json()
      router.push(`/polls/${poll.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Create New Poll</h1>
      <PollForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}