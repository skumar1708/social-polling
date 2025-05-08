import { useState } from 'react'
import { useRouter } from 'next/router'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid'

interface PollFormProps {
  onSubmit: (data: { title: string; options: string[] }) => Promise<void>
  loading?: boolean
}

export default function PollForm({ onSubmit, loading = false }: PollFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (options.some(option => !option.trim())) {
      alert('Please fill in all options')
      return
    }
    await onSubmit({ title, options })
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert('A poll must have at least 2 options')
      return
    }
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  return (
    <div className="w-full mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold leading-6 text-gray-900">
            Poll Title
          </label>
          <div className="mt-2">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="What would you like to ask?"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold leading-6 text-gray-900 mb-4">
            Poll Options
          </label>
          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                    className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      title="Remove option"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                  {index === options.length - 1 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      title="Add option"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-4 pt-4 border-t border-gray-900/10">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  )
}  