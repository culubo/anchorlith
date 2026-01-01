'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface Link {
  label: string
  url: string
}

export function LinksEditor() {
  const [links, setLinks] = useState<Link[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const addLink = () => {
    setLinks([...links, { label: '', url: '' }])
  }

  const updateLink = (index: number, field: keyof Link, value: string) => {
    const updated = [...links]
    updated[index] = { ...updated[index], [field]: value }
    setLinks(updated)
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const slug = `links-${Math.random().toString(36).substring(7)}`

      await supabase.from('public_pages').upsert({
        user_id: user.id,
        type: 'links',
        slug,
        visibility: 'private',
        content_json: { links },
      })

      alert('Links saved!')
    } catch (error) {
      console.error('Failed to save links:', error)
      alert('Failed to save links')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 pl-8">
      <Button onClick={addLink}>Add Link</Button>

      {links.map((link, index) => (
        <div key={index} className="flex items-center gap-4 pb-4 border-b border-border-subtle">
          <Input
            label="Label"
            value={link.label}
            onChange={(e) => updateLink(index, 'label', e.target.value)}
            className="flex-1"
          />
          <Input
            label="URL"
            type="url"
            value={link.url}
            onChange={(e) => updateLink(index, 'url', e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => removeLink(index)}
            variant="ghost"
            className="text-sm text-red-500 hover:text-red-600 mt-6"
          >
            Remove
          </Button>
        </div>
      ))}

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Links'}
      </Button>
    </div>
  )
}

