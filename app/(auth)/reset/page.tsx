'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    const checkSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (cancelled) return

      if (error || !user) {
        setHasSession(false)
        setMessage('Error: This reset link is invalid or expired. Please request a new one.')
      } else {
        setHasSession(true)
      }

      setChecking(false)
    }

    checkSession()

    return () => {
      cancelled = true
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || hasSession === false) return

    if (password.length < 8) {
      setMessage('Error: Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Error: Passwords do not match.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage(`Error: ${error.message}`)
      setLoading(false)
      return
    }

    setMessage('Password updated. Redirecting...')
    window.location.href = '/today'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md px-6">
        <h1 className="text-2xl mb-2 text-text-primary">Set a new password</h1>
        <p className="text-sm text-text-secondary mb-4">Choose a new password to finish signing in.</p>

        {hasSession === false ? (
          <div className="text-sm text-red-500">
            <p>{message}</p>
            <p className="mt-2 text-text-secondary">
              <a href="/auth/forgot" className="underline">Request another reset link</a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm text-text-secondary mb-2">
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
                placeholder="At least 8 characters"
                disabled={loading || checking}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-text-secondary mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
                placeholder="Re-enter password"
                disabled={loading || checking}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || checking}>
              {loading ? 'Updating...' : 'Update password'}
            </Button>

            {message && (
              <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-text-secondary'}`}>
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
