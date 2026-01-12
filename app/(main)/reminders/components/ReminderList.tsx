'use client'

import { useState, useEffect } from 'react'
import type { Reminder } from '@/lib/queries/reminders'
import type { Event } from '@/lib/queries/events'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { createReminder, deleteReminder, updateReminder } from '../actions'
import { motion } from 'framer-motion'

export function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const getDefaultDate = (): string => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  const getDefaultTime = (): string => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  const [title, setTitle] = useState('')
  const [remindDate, setRemindDate] = useState(getDefaultDate())
  const [remindTime, setRemindTime] = useState(getDefaultTime())
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | null>(null)
  const [repeatInterval, setRepeatInterval] = useState(1)
  const [repeatEndDate, setRepeatEndDate] = useState('')
  const [eventId, setEventId] = useState<string | null>(null)
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

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  useEffect(() => {
    loadReminders()
    loadEvents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !remindDate || !remindTime) return

    const remindAtISO = new Date(`${remindDate}T${remindTime}`).toISOString()

    setIsSubmitting(true)
    try {
      await createReminder({
        title: title.trim(),
        remind_at: remindAtISO,
        repeat_type: repeatType || null,
        repeat_interval: repeatType ? repeatInterval : undefined,
        repeat_end_date: repeatEndDate ? new Date(repeatEndDate).toISOString() : null,
        event_id: eventId || null,
      })
      setTitle('')
      setRemindDate(getDefaultDate())
      setRemindTime(getDefaultTime())
      setRepeatType(null)
      setRepeatInterval(1)
      setRepeatEndDate('')
      setEventId(null)
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

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      await updateReminder({
        id: reminder.id,
        is_completed: !reminder.is_completed,
      })
      loadReminders()
    } catch (error) {
      console.error('Failed to update reminder:', error)
    }
  }

  const getRepeatDescription = (reminder: Reminder): string | null => {
    if (!reminder.repeat_type) return null
    
    const interval = reminder.repeat_interval || 1
    const type = reminder.repeat_type
    let desc = ''
    
    if (interval === 1) {
      desc = type.charAt(0).toUpperCase() + type.slice(1)
    } else {
      desc = `Every ${interval} ${type}s`
    }
    
    if (reminder.repeat_end_date) {
      const endDate = new Date(reminder.repeat_end_date)
      desc += ` until ${formatDateTime(endDate.toISOString())}`
    }
    
    return desc
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
          <div>
            <label className="block text-sm text-text-secondary mb-2">Remind At</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={remindDate}
                onChange={(e) => setRemindDate(e.target.value)}
                required
              />
              <Input
                type="time"
                value={remindTime}
                onChange={(e) => setRemindTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Repeat
            </label>
            <select
              value={repeatType || ''}
              onChange={(e) => setRepeatType(e.target.value as any || null)}
              className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
            >
              <option value="">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {repeatType && (
            <>
              <Input
                label="Repeat Every (interval)"
                type="number"
                min="1"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(parseInt(e.target.value) || 1)}
                required
              />
              <Input
                label="End Date (optional)"
                type="datetime-local"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Link to Event (optional)
            </label>
            <select
              value={eventId || ''}
              onChange={(e) => setEventId(e.target.value || null)}
              className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
            >
              <option value="">No event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {formatDateTime(event.start_at)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Reminder'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false)
                setTitle('')
                setRemindDate(getDefaultDate())
                setRemindTime(getDefaultTime())
                setRepeatType(null)
                setRepeatInterval(1)
                setRepeatEndDate('')
                setEventId(null)
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
          reminders
            .filter(r => !r.is_completed)
            .map((reminder, index) => {
              const linkedEvent = reminder.event_id 
                ? events.find(e => e.id === reminder.event_id)
                : null
              const repeatDesc = getRepeatDescription(reminder)
              
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <Checkbox
                        checked={reminder.is_completed}
                        onChange={() => handleToggleComplete(reminder)}
                      />
                      <div className="flex-1">
                        <h3 className="text-base text-text-primary">
                          {reminder.title}
                        </h3>
                        {linkedEvent && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            📅 Linked to: {linkedEvent.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {formatRelativeTime(reminder.remind_at)}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {formatDateTime(reminder.remind_at)}
                    </p>
                    {repeatDesc && (
                      <p className="text-xs text-text-secondary mt-1">
                        🔁 {repeatDesc}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDelete(reminder.id)}
                    variant="ghost"
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Delete
                  </Button>
                </motion.div>
              )
            })
        )}
      </div>
    </div>
  )
}

