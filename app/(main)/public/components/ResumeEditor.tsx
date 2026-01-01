'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface ResumeData {
  name?: string
  email?: string
  phone?: string
  summary?: string
  experience?: Array<{
    title: string
    company: string
    period: string
    description: string
  }>
  education?: Array<{
    degree: string
    school: string
    period: string
  }>
  skills?: string[]
}

export function ResumeEditor() {
  const [data, setData] = useState<ResumeData>({
    experience: [],
    education: [],
    skills: [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Generate or get slug
      const { data: existing } = await supabase
        .from('public_pages')
        .select('slug')
        .eq('user_id', user.id)
        .eq('type', 'resume')
        .single()

      const slug = existing?.slug || `resume-${Math.random().toString(36).substring(7)}`

      await supabase.from('public_pages').upsert({
        user_id: user.id,
        type: 'resume',
        slug,
        visibility: 'private',
        content_json: data,
      })

      alert('Resume saved!')
    } catch (error) {
      console.error('Failed to save resume:', error)
      alert('Failed to save resume')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 pl-8">
      <Input
        label="Name"
        value={data.name || ''}
        onChange={(e) => setData({ ...data, name: e.target.value })}
      />
      <Input
        label="Email"
        type="email"
        value={data.email || ''}
        onChange={(e) => setData({ ...data, email: e.target.value })}
      />
      <Input
        label="Phone"
        value={data.phone || ''}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
      />
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Summary
        </label>
        <textarea
          value={data.summary || ''}
          onChange={(e) => setData({ ...data, summary: e.target.value })}
          className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors resize-none"
          rows={4}
        />
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Resume'}
      </Button>
    </div>
  )
}

