import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/solid'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface PollOption {
  id: number
  option_text: string
  votes: number
}

interface Vote {
  id: number
  user_id: string
  option_id: number
  created_at: string
}

interface PollResultsProps {
  pollId: string
}

export default function PollResults({ pollId }: PollResultsProps) {
  const [options, setOptions] = useState<PollOption[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalVotes, setTotalVotes] = useState(0)
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all options for the poll
        const { data: optionsData, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', pollId)
          .order('votes', { ascending: false })

        if (optionsError) throw optionsError

        // Fetch all votes for the poll
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('poll_id', pollId)

        if (votesError) throw votesError

        setOptions(optionsData || [])
        setVotes(votesData || [])
        setTotalVotes(votesData?.length || 0)
      } catch (err) {
        setError('Failed to load poll results')
        console.error('Error fetching poll results:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()

    // Subscribe to real-time updates for both options and votes
    const optionsSubscription = supabase
      .channel('poll_options_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_options',
          filter: `poll_id=eq.${pollId}`,
        },
        () => {
          fetchResults()
        }
      )
      .subscribe()

    const votesSubscription = supabase
      .channel('votes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${pollId}`,
        },
        () => {
          fetchResults()
        }
      )
      .subscribe()

    return () => {
      optionsSubscription.unsubscribe()
      votesSubscription.unsubscribe()
    }
  }, [pollId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        No votes yet
      </div>
    )
  }

  // Calculate votes for each option
  const optionVotes = options.map(option => {
    const voteCount = votes.filter(vote => vote.option_id === option.id).length
    return {
      ...option,
      votes: voteCount
    }
  })

  const chartData = {
    labels: optionVotes.map(opt => opt.option_text),
    datasets: [
      {
        label: 'Votes',
        data: optionVotes.map(opt => opt.votes),
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',  // indigo
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(16, 185, 129, 0.8)', // emerald
          'rgba(245, 158, 11, 0.8)', // amber
          'rgba(239, 68, 68, 0.8)',  // red
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Poll Results',
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Results</h2>
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-all duration-200 ${
                chartType === 'bar'
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Bar Chart"
            >
              <ChartBarIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-md transition-all duration-200 ${
                chartType === 'pie'
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Pie Chart"
            >
              <ChartPieIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="h-[400px] transition-all duration-300">
          {chartType === 'bar' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Pie data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vote Breakdown</h2>
        <div className="space-y-4">
          {optionVotes.map((option) => {
            const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{option.option_text}</span>
                  <span className="text-gray-500">{option.votes} votes ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-700">Total Votes</span>
            <span className="text-indigo-600">{totalVotes}</span>
          </div>
        </div>
      </div>
    </div>
  )
}