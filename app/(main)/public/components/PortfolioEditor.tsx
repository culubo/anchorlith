'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { FileUpload } from '@/components/FileUpload'
import { motion } from 'framer-motion'

interface Project {
  title: string
  description: string
  link?: string
  imageUrl?: string
}

export function PortfolioEditor() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [uploadModes, setUploadModes] = useState<Record<number, 'url' | 'upload'>>({})
  const [username, setUsername] = useState('')
  const [publicUrl, setPublicUrl] = useState('')
  const supabase = createClient()

  // Load existing portfolio data
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: existing } = await supabase
          .from('public_pages')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'portfolio')
          .single()

        if (existing) {
          if (existing.content_json?.projects) {
            setProjects(existing.content_json.projects)
          }
          setUsername(existing.username || '')
          if (existing.username) {
            setPublicUrl(`/p/${existing.username}/portfolio`)
          }
        } else {
          // Generate username from email
          const emailUsername = user.email?.split('@')[0] || 'user'
          setUsername(emailUsername.toLowerCase().replace(/[^a-z0-9]/g, ''))
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error)
      }
    }
    loadPortfolio()
  }, [supabase])

  const addProject = () => {
    setProjects([...projects, { title: '', description: '' }])
  }

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects]
    updated[index] = { ...updated[index], [field]: value }
    setProjects(updated)
  }

  const toggleUploadMode = (index: number) => {
    setUploadModes(prev => ({
      ...prev,
      [index]: prev[index] === 'upload' ? 'url' : 'upload'
    }))
  }

  const handleImageUpload = (index: number, file: any) => {
    if (file.publicUrl) {
      updateProject(index, 'imageUrl', file.publicUrl)
    }
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

      if (!username.trim()) {
        alert('Please set a username')
        return
      }

      // Generate slug from username
      const slug = `${username}-portfolio`

      // Check if portfolio exists
      const { data: existing } = await supabase
        .from('public_pages')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'portfolio')
        .single()

      const updateData: any = {
        user_id: user.id,
        type: 'portfolio',
        slug,
        username: username.trim().toLowerCase(),
        visibility: 'public',
        content_json: { projects },
      }

      let error
      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('public_pages')
          .update(updateData)
          .eq('id', existing.id)
        error = updateError
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('public_pages')
          .insert(updateData)
        error = insertError
      }

      if (error) throw error

      setPublicUrl(`/p/${username.trim().toLowerCase()}/portfolio`)
      alert('Portfolio saved! Your public URL will be available when the app is hosted.')
    } catch (error: any) {
      console.error('Failed to save portfolio:', error)
      alert(`Failed to save portfolio: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 pl-8">
      <div className="space-y-4">
        <div>
          <Input
            label="Username (for URL)"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="username"
            required
          />
          {publicUrl && (
            <p className="text-sm text-text-secondary mt-1">
              Your portfolio will be available at: <code className="bg-bg-secondary px-2 py-1 rounded">{publicUrl}</code>
            </p>
          )}
        </div>
        <Button onClick={addProject}>Add Project</Button>
      </div>

      {projects.map((project, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pb-6 border-b border-border-subtle"
        >
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-text-secondary">
                Image (optional)
              </label>
              <button
                type="button"
                onClick={() => toggleUploadMode(index)}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                {uploadModes[index] === 'upload' ? 'Switch to URL' : 'Switch to Upload'}
              </button>
            </div>
            
            {uploadModes[index] === 'upload' ? (
              <div className="space-y-2">
                <FileUpload
                  linkedType="portfolio"
                  onUploadComplete={(file) => handleImageUpload(index, file)}
                  accept="image/*"
                />
                {project.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={project.imageUrl}
                      alt="Preview"
                      className="max-w-xs h-32 object-cover rounded border border-border-subtle"
                    />
                    <Button
                      type="button"
                      onClick={() => updateProject(index, 'imageUrl', '')}
                      variant="ghost"
                      className="text-xs text-red-500 hover:text-red-600 mt-1"
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="url"
                  value={project.imageUrl || ''}
                  onChange={(e) => updateProject(index, 'imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {project.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={project.imageUrl}
                      alt="Preview"
                      className="max-w-xs h-32 object-cover rounded border border-border-subtle"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={() => removeProject(index)}
            variant="ghost"
            className="text-sm text-red-500 hover:text-red-600"
          >
            Remove
          </Button>
        </motion.div>
      ))}

      <Button onClick={handleSave} disabled={isSaving || !username.trim()}>
        {isSaving ? 'Saving...' : 'Save Portfolio'}
      </Button>
    </div>
  )
}

