'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)
  const supabase = createClient()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Fetch all user data
      const [notesResult, todosResult, eventsResult, remindersResult] = await Promise.all([
        supabase.from('notes').select('*').eq('user_id', user.id),
        supabase.from('todos').select('*').eq('user_id', user.id),
        supabase.from('events').select('*').eq('user_id', user.id),
        supabase.from('reminders').select('*').eq('user_id', user.id),
      ])

      // Check for errors
      if (notesResult.error) throw new Error(`Failed to fetch notes: ${notesResult.error.message}`)
      if (todosResult.error) throw new Error(`Failed to fetch todos: ${todosResult.error.message}`)
      if (eventsResult.error) throw new Error(`Failed to fetch events: ${eventsResult.error.message}`)
      if (remindersResult.error) throw new Error(`Failed to fetch reminders: ${remindersResult.error.message}`)

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        notes: notesResult.data || [],
        todos: todosResult.data || [],
        events: eventsResult.data || [],
        reminders: remindersResult.data || [],
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `anchorlith-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="pl-8">
      <h3 className="text-base text-text-primary mb-4">Data Export</h3>
      <Button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export All Data'}
      </Button>
      <p className="text-sm text-text-tertiary mt-2">
        Download all your notes, todos, events, and reminders as JSON
      </p>
    </div>
  )
}

