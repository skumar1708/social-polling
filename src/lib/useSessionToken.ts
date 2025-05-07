import { useEffect } from 'react'

export function useSessionToken() {
  useEffect(() => {
    // Add session token to all fetch requests
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const [resource, config] = args
      const sessionToken = localStorage.getItem('supabase.auth.token')
      
      const newConfig = {
        ...config,
        headers: {
          ...config?.headers,
          'x-session-token': sessionToken || '',
        },
      }

      return originalFetch(resource, newConfig)
    }

    return () => {
      // Restore original fetch
      window.fetch = originalFetch
    }
  }, [])
} 