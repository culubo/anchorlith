'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

import { Checkbox } from '@/components/ui/Checkbox'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [stayLoggedIn, setStayLoggedIn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_PROJECT')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-full max-w-md px-6">
          <h1 className="text-2xl mb-2 text-text-primary">AnchorLith</h1>
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
              Supabase Configuration Required
            </p>
            <p className="text-xs text-red-700 dark:text-red-300">
              Please configure your Supabase credentials in <code className="bg-red-100 dark:bg-red-900 px-1 rounded">.env.local</code> file.
              <br /><br />
              Get your credentials from: <br />
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">
                Supabase Dashboard → Settings → API
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Store preference for session persistence
      localStorage.setItem('stayLoggedIn', stayLoggedIn.toString())
      
      // Get the site URL for the magic link redirect
      // In production (Vercel), set NEXT_PUBLIC_SITE_URL environment variable to your domain
      // In development, this will use window.location.origin (localhost:3000)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectUrl = `${siteUrl}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
        setLoading(false)
      } else {
        setMessage('Check your email for the magic link!')
        setLoading(false)
      }
    } catch (err: unknown) {
      console.error('Login error:', err)
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('Failed to fetch') || message.includes('ERR_NAME_NOT_RESOLVED')) {
        setMessage('Cannot connect to Supabase. Please verify your Supabase project URL in .env.local is correct and the project is active.')
      } else {
        setMessage(`Failed to connect: ${message || 'Please check your connection and try again'}`)
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md px-6">
        <h1 className="text-2xl mb-2 text-text-primary">AnchorLith</h1>
        <p className="text-sm text-text-secondary mb-8">
          Sign in with your email
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="flex items-center">
            <Checkbox
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
              label="Stay logged in"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-text-primary hover:text-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>

          {message && (
            <p className={`text-sm ${message.includes('error') || message.includes('Error') ? 'text-red-500' : 'text-text-secondary'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

