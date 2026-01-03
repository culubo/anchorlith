'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + '/auth/callback'
      })
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('If an account exists for that email, a reset link has been sent.')
      }
    } catch (err) {
      setMessage('Failed to send request. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md px-6">
        <h1 className="text-2xl mb-2 text-text-primary">Reset your password</h1>
        <p className="text-sm text-text-secondary mb-4">Enter your email and we’ll send a password reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-2">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors" placeholder="you@example.com" disabled={loading} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</Button>
          {message && <p className="text-sm text-text-secondary">{message}</p>}
        </form>
      </div>
    </div>
  )
}
