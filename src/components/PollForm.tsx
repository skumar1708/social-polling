import { useState } from 'react'
import { useRouter } from 'next/router'

export default function PollForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      // Validate inputs
      if (!title.trim()) {
        throw new Error('Please enter a poll title')
      }

      const validOptions = options.filter(opt => opt.trim())
      if (validOptions.length < 2) {
        throw new Error('Please enter at least 2 options')
      }

      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          options: validOptions, 
          user_id: userId 
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create poll')
      }

      const data = await res.json()
      router.push(`/polls/${data.poll.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Poll</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Poll Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter your poll question"
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Options
        </label>
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={opt}
              onChange={e => {
                const newOpts = [...options]
                newOpts[i] = e.target.value
                setOptions(newOpts)
              }}
              placeholder={`Option ${i + 1}`}
              className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                disabled={loading}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={addOption}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          disabled={loading}
        >
          Add Option
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Poll'}
        </button>
      </div>
    </div>
  )
}  