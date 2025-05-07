import { useRouter } from 'next/router'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (error) throw error

      // Wait for session to be set in localStorage
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify session is set
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('Session not set properly')
      }

      const redirectTo = router.query.redirectedFrom as string || '/dashboard'
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl mb-4">Sign In</h1>
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
        onClick={handleSignIn} 
        className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-blue-400 mb-4"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <div className="text-center">
        <p className="text-gray-600 mb-2">Don&apos;t have an account?</p>
        <Link href="/auth/signup">
          <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors">
            Create Account
          </button>
        </Link>
      </div>
    </div>
  )
}