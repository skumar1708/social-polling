// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! || `https://itywamladyrmvwzfjflo.supabase.co`
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eXdhbWxhZHlybXZ3emZqZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODU3NzIsImV4cCI6MjA2MjE2MTc3Mn0.owxpGUJLx7n74QC9W88WKhidkZ_d0hzC-MKl_Hpthcg`

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-auth-token',
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null
        const cookies = document.cookie.split(';')
        const cookie = cookies.find(c => c.trim().startsWith(`${key}=`))
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : null
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return
        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`
      },
    },
  },
})
