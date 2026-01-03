'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { ResumePreview } from './ResumePreview'
import { motion } from 'framer-motion'

export interface ResumeData {
  name?: string
  email?: string
  phone?: string
  location?: string
  website?: string
  linkedin?: string
  github?: string
  summary?: string
  experience?: Array<{
    title: string
    company: string
    location?: string
    startDate: string
    endDate?: string
    current?: boolean
    description: string[]
  }>
  education?: Array<{
    degree: string
    school: string
    location?: string
    startDate: string
    endDate?: string
    gpa?: string
    honors?: string[]
  }>
  skills?: Array<{
    category: string
    items: string[]
  }>
  projects?: Array<{
    name: string
    description: string
    technologies?: string[]
    link?: string
  }>
  certifications?: Array<{
    name: string
    issuer: string
    date: string
    expiryDate?: string
  }>
}

export function ResumeEditor() {
  const [data, setData] = useState<ResumeData>({
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  })
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [username, setUsername] = useState('')
  const [publicUrl, setPublicUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Load existing resume data
  useEffect(() => {
    const loadResume = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: existing } = await supabase
          .from('public_pages')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'resume')
          .single()

        if (existing) {
          setData(existing.content_json as ResumeData)
          setUsername(existing.username || '')
          if (existing.username) {
            setPublicUrl(`/p/${existing.username}/resume`)
          }
        } else {
          // Generate username from email
          const emailUsername = user.email?.split('@')[0] || 'user'
          setUsername(emailUsername.toLowerCase().replace(/[^a-z0-9]/g, ''))
        }
      } catch (error) {
        console.error('Failed to load resume:', error)
      }
    }
    loadResume()
  }, [supabase])

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    setIsParsing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to parse PDF: ${response.statusText}`)
      }

      const extractedData = await response.json()

      // Merge extracted data with existing data (don't overwrite, just fill in blanks)
      setData(prev => ({
        name: prev.name || extractedData.name || '',
        email: prev.email || extractedData.email || '',
        phone: prev.phone || extractedData.phone || '',
        location: prev.location || extractedData.location || '',
        website: prev.website || extractedData.website || '',
        linkedin: prev.linkedin || extractedData.linkedin || '',
        github: prev.github || extractedData.github || '',
        summary: prev.summary || extractedData.summary || '',
        experience: prev.experience && prev.experience.length > 0 
          ? prev.experience 
          : (extractedData.experience || []),
        education: prev.education && prev.education.length > 0 
          ? prev.education 
          : (extractedData.education || []),
        skills: prev.skills && prev.skills.length > 0 
          ? prev.skills 
          : (extractedData.skills || []),
        projects: prev.projects && prev.projects.length > 0 
          ? prev.projects 
          : (extractedData.projects || []),
        certifications: prev.certifications && prev.certifications.length > 0 
          ? prev.certifications 
          : (extractedData.certifications || []),
      }))

      // Show success message
      const hasData = extractedData.name || extractedData.email || extractedData.experience?.length > 0
      if (hasData) {
        alert('Resume data extracted successfully! Please review and edit the extracted information.')
      } else {
        alert('PDF uploaded but could not extract structured data. Please fill in the form manually.')
      }
    } catch (error: any) {
      console.error('Failed to parse PDF:', error)
      alert(`Failed to parse PDF: ${error.message}`)
    } finally {
      setIsParsing(false)
      e.target.value = '' // Reset input
    }
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
      const slug = `${username}-resume`

      // Check if resume exists
      const { data: existing, error: queryError } = await supabase
        .from('public_pages')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'resume')
        .maybeSingle() // Use maybeSingle() instead of single() to avoid errors when no record exists

      // If there's a query error that's not "no rows returned", throw it
      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError
      }

      const updateData: any = {
        user_id: user.id,
        type: 'resume',
        slug,
        username: username.trim().toLowerCase(),
        visibility: 'public',
        content_json: data,
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

      if (error) {
        // Supabase errors have a message property
        const errorMessage = error.message || error.details || error.hint || 'Unknown error'
        throw new Error(errorMessage)
      }

      setPublicUrl(`/p/${username.trim().toLowerCase()}/resume`)
      alert('Resume saved! Your public URL will be available when the app is hosted.')
    } catch (error: any) {
      console.error('Failed to save resume:', error)
      // Extract error message properly from various error types
      const errorMessage = error?.message || error?.details || error?.hint || 'Unknown error occurred'
      alert(`Failed to save resume: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  const addExperience = () => {
    setData({
      ...data,
      experience: [
        ...(data.experience || []),
        { title: '', company: '', startDate: '', description: [] },
      ],
    })
  }

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...(data.experience || [])]
    updated[index] = { ...updated[index], [field]: value }
    setData({ ...data, experience: updated })
  }

  const removeExperience = (index: number) => {
    setData({
      ...data,
      experience: data.experience?.filter((_, i) => i !== index) || [],
    })
  }

  const addEducation = () => {
    setData({
      ...data,
      education: [
        ...(data.education || []),
        { degree: '', school: '', startDate: '', endDate: '' },
      ],
    })
  }

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...(data.education || [])]
    updated[index] = { ...updated[index], [field]: value }
    setData({ ...data, education: updated })
  }

  const removeEducation = (index: number) => {
    setData({
      ...data,
      education: data.education?.filter((_, i) => i !== index) || [],
    })
  }

  const addSkillCategory = () => {
    setData({
      ...data,
      skills: [...(data.skills || []), { category: '', items: [] }],
    })
  }

  const updateSkillCategory = (index: number, category: string, items: string[]) => {
    const updated = [...(data.skills || [])]
    updated[index] = { category, items }
    setData({ ...data, skills: updated })
  }

  const removeSkillCategory = (index: number) => {
    setData({
      ...data,
      skills: data.skills?.filter((_, i) => i !== index) || [],
    })
  }

  if (showPreview) {
    return (
      <div className="space-y-6">
        <ResumePreview data={data} onClose={() => setShowPreview(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-8 pl-8">
      {/* PDF Upload Section */}
      <div className="p-4 border border-border-subtle rounded-lg bg-bg-secondary space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              Upload Existing Resume (PDF)
            </h3>
            <p className="text-sm text-text-secondary">
              Upload your PDF resume to automatically extract information
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handlePDFUpload}
              disabled={isParsing}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
              variant="ghost"
              className="text-sm"
            >
              {isParsing ? 'Parsing PDF...' : 'Upload Resume PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={data.name || ''}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            value={data.email || ''}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="john@example.com"
          />
          <Input
            label="Phone"
            value={data.phone || ''}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
          <Input
            label="Location"
            value={data.location || ''}
            onChange={(e) => setData({ ...data, location: e.target.value })}
            placeholder="City, State"
          />
          <Input
            label="Website"
            value={data.website || ''}
            onChange={(e) => setData({ ...data, website: e.target.value })}
            placeholder="https://yourwebsite.com"
          />
          <Input
            label="LinkedIn"
            value={data.linkedin || ''}
            onChange={(e) => setData({ ...data, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/username"
          />
          <Input
            label="GitHub"
            value={data.github || ''}
            onChange={(e) => setData({ ...data, github: e.target.value })}
            placeholder="https://github.com/username"
          />
          <Input
            label="Username (for URL)"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="username"
            required
          />
        </div>
        {publicUrl && (
          <p className="text-sm text-text-secondary">
            Your resume will be available at: <code className="bg-bg-secondary px-2 py-1 rounded">{publicUrl}</code>
          </p>
        )}
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Professional Summary
        </label>
        <textarea
          value={data.summary || ''}
          onChange={(e) => setData({ ...data, summary: e.target.value })}
          className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors resize-none"
          rows={4}
          placeholder="Brief professional summary..."
        />
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Experience</h2>
          <Button onClick={addExperience} variant="ghost" className="text-sm">
            + Add Experience
          </Button>
        </div>
        {data.experience?.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-border-subtle rounded space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Job Title"
                value={exp.title}
                onChange={(e) => updateExperience(index, 'title', e.target.value)}
              />
              <Input
                label="Company"
                value={exp.company}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
              />
              <Input
                label="Location"
                value={exp.location || ''}
                onChange={(e) => updateExperience(index, 'location', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                />
                <div className="flex items-end gap-2">
                  <Input
                    label="End Date"
                    type="month"
                    value={exp.endDate || ''}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    disabled={exp.current}
                  />
                  <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <input
                      type="checkbox"
                      checked={exp.current || false}
                      onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Current
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Description (one bullet per line)
              </label>
              <textarea
                value={exp.description.join('\n')}
                onChange={(e) => updateExperience(index, 'description', e.target.value.split('\n').filter(l => l.trim()))}
                className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors resize-none"
                rows={3}
                placeholder="• Accomplished X&#10;• Led Y initiative&#10;• Improved Z by 50%"
              />
            </div>
            <Button
              onClick={() => removeExperience(index)}
              variant="ghost"
              className="text-sm text-red-500 hover:text-red-600"
            >
              Remove
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Education</h2>
          <Button onClick={addEducation} variant="ghost" className="text-sm">
            + Add Education
          </Button>
        </div>
        {data.education?.map((edu, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-border-subtle rounded space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Degree"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
              />
              <Input
                label="School"
                value={edu.school}
                onChange={(e) => updateEducation(index, 'school', e.target.value)}
              />
              <Input
                label="Location"
                value={edu.location || ''}
                onChange={(e) => updateEducation(index, 'location', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                />
                <Input
                  label="End Date"
                  type="month"
                  value={edu.endDate || ''}
                  onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                />
              </div>
              <Input
                label="GPA (optional)"
                value={edu.gpa || ''}
                onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                placeholder="3.8/4.0"
              />
              <Input
                label="Honors (comma-separated)"
                value={edu.honors?.join(', ') || ''}
                onChange={(e) => updateEducation(index, 'honors', e.target.value.split(',').map(h => h.trim()).filter(h => h))}
                placeholder="Summa Cum Laude, Dean's List"
              />
            </div>
            <Button
              onClick={() => removeEducation(index)}
              variant="ghost"
              className="text-sm text-red-500 hover:text-red-600"
            >
              Remove
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Skills</h2>
          <Button onClick={addSkillCategory} variant="ghost" className="text-sm">
            + Add Category
          </Button>
        </div>
        {data.skills?.map((skillGroup, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-border-subtle rounded space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Category"
                value={skillGroup.category}
                onChange={(e) => updateSkillCategory(index, e.target.value, skillGroup.items)}
                placeholder="e.g., Programming Languages"
              />
              <Input
                label="Skills (comma-separated)"
                value={skillGroup.items.join(', ')}
                onChange={(e) => updateSkillCategory(index, skillGroup.category, e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                placeholder="JavaScript, Python, React"
              />
            </div>
            <Button
              onClick={() => removeSkillCategory(index)}
              variant="ghost"
              className="text-sm text-red-500 hover:text-red-600"
            >
              Remove
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Projects</h2>
          <Button
            onClick={() => setData({ ...data, projects: [...(data.projects || []), { name: '', description: '', technologies: [] }] })}
            variant="ghost"
            className="text-sm"
          >
            + Add Project
          </Button>
        </div>
        {data.projects?.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-border-subtle rounded space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Project Name"
                value={project.name}
                onChange={(e) => {
                  const updated = [...(data.projects || [])]
                  updated[index] = { ...updated[index], name: e.target.value }
                  setData({ ...data, projects: updated })
                }}
              />
              <Input
                label="Link (optional)"
                value={project.link || ''}
                onChange={(e) => {
                  const updated = [...(data.projects || [])]
                  updated[index] = { ...updated[index], link: e.target.value }
                  setData({ ...data, projects: updated })
                }}
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) => {
                    const updated = [...(data.projects || [])]
                    updated[index] = { ...updated[index], description: e.target.value }
                    setData({ ...data, projects: updated })
                  }}
                  className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors resize-none"
                  rows={2}
                />
              </div>
              <Input
                label="Technologies (comma-separated)"
                value={project.technologies?.join(', ') || ''}
                onChange={(e) => {
                  const updated = [...(data.projects || [])]
                  updated[index] = { ...updated[index], technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t) }
                  setData({ ...data, projects: updated })
                }}
              />
            </div>
            <Button
              onClick={() => setData({ ...data, projects: data.projects?.filter((_, i) => i !== index) || [] })}
              variant="ghost"
              className="text-sm text-red-500 hover:text-red-600"
            >
              Remove
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Certifications</h2>
          <Button
            onClick={() => setData({ ...data, certifications: [...(data.certifications || []), { name: '', issuer: '', date: '' }] })}
            variant="ghost"
            className="text-sm"
          >
            + Add Certification
          </Button>
        </div>
        {data.certifications?.map((cert, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-border-subtle rounded space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Certification Name"
                value={cert.name}
                onChange={(e) => {
                  const updated = [...(data.certifications || [])]
                  updated[index] = { ...updated[index], name: e.target.value }
                  setData({ ...data, certifications: updated })
                }}
              />
              <Input
                label="Issuer"
                value={cert.issuer}
                onChange={(e) => {
                  const updated = [...(data.certifications || [])]
                  updated[index] = { ...updated[index], issuer: e.target.value }
                  setData({ ...data, certifications: updated })
                }}
              />
              <Input
                label="Date"
                type="month"
                value={cert.date}
                onChange={(e) => {
                  const updated = [...(data.certifications || [])]
                  updated[index] = { ...updated[index], date: e.target.value }
                  setData({ ...data, certifications: updated })
                }}
              />
              <Input
                label="Expiry Date (optional)"
                type="month"
                value={cert.expiryDate || ''}
                onChange={(e) => {
                  const updated = [...(data.certifications || [])]
                  updated[index] = { ...updated[index], expiryDate: e.target.value }
                  setData({ ...data, certifications: updated })
                }}
              />
            </div>
            <Button
              onClick={() => setData({ ...data, certifications: data.certifications?.filter((_, i) => i !== index) || [] })}
              variant="ghost"
              className="text-sm text-red-500 hover:text-red-600"
            >
              Remove
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-border-subtle">
        <Button onClick={handleSave} disabled={isSaving || !username.trim()}>
          {isSaving ? 'Saving...' : 'Save Resume'}
        </Button>
        <Button onClick={() => setShowPreview(true)} variant="ghost">
          Preview
        </Button>
      </div>
    </div>
  )
}
