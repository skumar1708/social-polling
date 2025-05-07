import { useRouter } from 'next/router'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    try {
      setLoading(true)
      setError('')
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border p-2 mb-2"
        disabled={loading}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border p-2 mb-4"
        disabled={loading}
      />
      <button 
        onClick={handleSignUp} 
        className="w-full bg-green-600 text-white p-2 rounded disabled:bg-green-400 mb-4"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
      <div className="text-center">
        <p className="text-gray-600 mb-2">Already have an account?</p>
        <Link href="/auth/signin">
          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </Link>
      </div>
    </div>
  )
}