'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface Project {
  title: string
  description: string
  link?: string
  imageUrl?: string
}

export function PortfolioEditor() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const addProject = () => {
    setProjects([...projects, { title: '', description: '' }])
  }

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects]
    updated[index] = { ...updated[index], [field]: value }
    setProjects(updated)
  }

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const slug = `portfolio-${Math.random().toString(36).substring(7)}`

      await supabase.from('public_pages').upsert({
        user_id: user.id,
        type: 'portfolio',
        slug,
        visibility: 'private',
        content_json: { projects },
      })

      alert('Portfolio saved!')
    } catch (error) {
      console.error('Failed to save portfolio:', error)
      alert('Failed to save portfolio')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 pl-8">
      <Button onClick={addProject}>Add Project</Button>

      {projects.map((project, index) => (
        <div key={index} className="space-y-4 pb-6 border-b border-border-subtle">
          <Input
            label="Title"
            value={project.title}
            onChange={(e) => updateProject(index, 'title', e.target.value)}
          />
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={project.description}
              onChange={(e) => updateProject(index, 'description', e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors resize-none"
              rows={3}
            />
          </div>
          <Input
            label="Link (optional)"
            type="url"
            value={project.link || ''}
            onChange={(e) => updateProject(index, 'link', e.target.value)}
          />
          <Input
            label="Image URL (optional)"
            type="url"
            value={project.imageUrl || ''}
            onChange={(e) => updateProject(index, 'imageUrl', e.target.value)}
          />
          <Button
            onClick={() => removeProject(index)}
            variant="ghost"
            className="text-sm text-red-500 hover:text-red-600"
          >
            Remove
          </Button>
        </div>
      ))}

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Portfolio'}
      </Button>
    </div>
  )
}

