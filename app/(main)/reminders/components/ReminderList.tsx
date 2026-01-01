'use client'

import { useState, useEffect } from 'react'
import type { Reminder } from '@/lib/queries/reminders'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createReminder, deleteReminder } from '../actions'
import { motion } from 'framer-motion'

export function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      if (!response.ok) throw new Error('Failed to fetch reminders')
      const data = await response.json()
      setReminders(data)
    } catch (error) {
      console.error('Failed to load reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !remindAt) return

    setIsSubmitting(true)
    try {
      await createReminder({
        title: title.trim(),
        remind_at: new Date(remindAt).toISOString(),
      })
      setTitle('')
      setRemindAt('')
      setShowForm(false)
      loadReminders()
    } catch (error) {
      console.error('Failed to create reminder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reminder?')) return

    try {
      await deleteReminder(id)
      loadReminders()
    } catch (error) {
      console.error('Failed to delete reminder:', error)
    }
  }

  if (loading) {
    return <div className="text-text-secondary">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          New Reminder
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pl-8">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Remind At"
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            required
          />
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Reminder'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false)
                setTitle('')
                setRemindAt('')
              }}
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4 pl-8">
        {reminders.length === 0 ? (
          <p className="text-sm text-text-tertiary">No reminders</p>
        ) : (
          reminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle last:border-0"
            >
              <div className="flex-1">
                <h3 className="text-base text-text-primary mb-1">
                  {reminder.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {formatRelativeTime(reminder.remind_at)}
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  {formatDateTime(reminder.remind_at)}
                </p>
              </div>
              <Button
                onClick={() => handleDelete(reminder.id)}
                variant="ghost"
                className="text-sm text-red-500 hover:text-red-600"
              >
                Delete
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

