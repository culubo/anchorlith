'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

import { Checkbox } from '@/components/ui/Checkbox'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [stayLoggedIn, setStayLoggedIn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [password, setPassword] = useState('')
  const [createAccount, setCreateAccount] = useState(false)
  
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

      // Resolve site URL safely. In production we require NEXT_PUBLIC_SITE_URL to be set and not point to localhost.
      const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
      let siteUrl: string

      if (process.env.NODE_ENV === 'production') {
        if (!envSiteUrl || envSiteUrl.includes('localhost') || envSiteUrl.includes('127.0.0.1')) {
          setMessage(
            "Invalid or missing NEXT_PUBLIC_SITE_URL in production. Set NEXT_PUBLIC_SITE_URL to your site domain (e.g. https://example.com) in your hosting provider (e.g., Vercel), and add https://<your-domain>/auth/callback to Supabase Auth → Redirect URLs. See: https://supabase.com/docs/guides/auth/redirects"
          )
          setLoading(false)
          return
        }
        siteUrl = envSiteUrl
      } else {
        siteUrl = envSiteUrl || window.location.origin
      }

      if (mode === 'magic') {
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
      } else {
        // Password mode: either sign in or create account
        if (createAccount) {
          const { data, error } = await supabase.auth.signUp({ email, password })
          if (error) {
            setMessage(`Error: ${error.message}`)
            setLoading(false)
          } else {
            // If an immediate session was created (emailless or auto-confirm), redirect; otherwise prompt to confirm
            if ((data as any)?.session) {
              window.location.href = '/today'
            } else {
              setMessage('Account created. Check your email to confirm your account before signing in.')
              setLoading(false)
            }
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) {
            setMessage(`Error: ${error.message}`)
            setLoading(false)
          } else {
            // Successful sign-in - redirect to app
            window.location.href = '/today'
          }
        }
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
        <p className="text-sm text-text-secondary mb-4">
          Sign in with your email
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('magic')}
            className={`px-3 py-1 rounded ${mode === 'magic' ? 'bg-accent text-white' : 'bg-transparent text-text-secondary border border-border-subtle'}`}>
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`px-3 py-1 rounded ${mode === 'password' ? 'bg-accent text-white' : 'bg-transparent text-text-secondary border border-border-subtle'}`}>
            Password
          </button>
        </div>

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

          {mode === 'password' && (
            <div>
              <label htmlFor="password" className="block text-sm text-text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
                placeholder="Your password"
                disabled={loading}
              />

              <div className="mt-2">
                <Checkbox
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  label="Create account"
                />
              </div>
            </div>
          )}

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
            {loading ? (mode === 'magic' ? 'Sending...' : (createAccount ? 'Creating...' : 'Signing in...')) : (mode === 'magic' ? 'Send magic link' : (createAccount ? 'Create account' : 'Sign in'))}
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

