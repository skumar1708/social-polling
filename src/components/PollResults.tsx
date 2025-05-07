import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Option } from '../types'
export default function PollResults({ pollId }: { pollId: string }) {
  const [results, setResults] = useState<Record<string, number>>({})
  const [options, setOptions] = useState<Option[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      const { data: optionsData } = await supabase.from('options').select('*').eq('poll_id', pollId)
      const { data: votesData } = await supabase.from('votes').select('*').eq('poll_id', pollId)

      const counts: Record<string, number> = {}
      optionsData?.forEach(opt => {
        counts[opt.text] = votesData?.filter(v => v.option_id === opt.id).length || 0
      })
      setOptions(optionsData || [])
      setResults(counts)
    }

    fetchResults()

    const subscription = supabase
      .channel('realtime:polls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => fetchResults())
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [pollId])

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0)

  return (
    <div className="mt-4 space-y-2">
      {options.map(opt => {
        const count = results[opt.text] || 0
        const percent = totalVotes ? ((count / totalVotes) * 100).toFixed(1) : 0
        return (
          <div key={opt.id} className="bg-gray-100 p-2 rounded">
            <div className="flex justify-between">
              <span>{opt.text}</span>
              <span>{count} votes ({percent}%)</span>
            </div>
            <div className="bg-blue-500 h-2 mt-1 rounded" style={{ width: `${percent}%` }}></div>
          </div>
        )
      })}
      <p className="text-sm text-gray-500">Total Votes: {totalVotes}</p>
    </div>
  )
}