'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createEvent, updateEvent } from '../actions'
import type { Event } from '@/lib/queries/events'

interface EventFormProps {
  onSuccess: () => void
  onCancel: () => void
  prefilledDate?: Date | null
  event?: Event | null
}

export function EventForm({ onSuccess, onCancel, prefilledDate, event }: EventFormProps) {
  // Helper to get default date (today) and time (current hour)
  const getDefaultDate = (): string => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  const getDefaultTime = (): string => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  // Format date for datetime-local input
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const parseDateAndTime = (dateStr: string, timeStr: string): string => {
    if (!dateStr || !timeStr) return ''
    return `${dateStr}T${timeStr}`
  }

  const getInitialStartDate = (): string => {
    if (prefilledDate) {
      const d = prefilledDate
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    if (event?.start_at) {
      const d = new Date(event.start_at)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    return getDefaultDate()
  }

  const getInitialStartTime = (): string => {
    if (prefilledDate) {
      const d = prefilledDate
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    if (event?.start_at) {
      const d = new Date(event.start_at)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    return getDefaultTime()
  }

  const getInitialEndDate = (): string => {
    if (event?.end_at) {
      const d = new Date(event.end_at)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    return ''
  }

  const getInitialEndTime = (): string => {
    if (event?.end_at) {
      const d = new Date(event.end_at)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    return ''
  }

  const [title, setTitle] = useState(event?.title || '')
  const [startDate, setStartDate] = useState(getInitialStartDate())
  const [startTime, setStartTime] = useState(getInitialStartTime())
  const [endDate, setEndDate] = useState(getInitialEndDate())
  const [endTime, setEndTime] = useState(getInitialEndTime())
  const [location, setLocation] = useState(event?.location || '')
  const [notes, setNotes] = useState(event?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      if (event.start_at) {
        const d = new Date(event.start_at)
        setStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
        setStartTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
      }
      if (event.end_at) {
        const d = new Date(event.end_at)
        setEndDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
        setEndTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
      }
      setLocation(event.location || '')
      setNotes(event.notes || '')
    }
  }, [event])

  // Update startDate/startTime when prefilledDate changes
  useEffect(() => {
    if (prefilledDate) {
      const d = prefilledDate
      setStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      setStartTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }
  }, [prefilledDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startDate || !startTime) return

    const startAtISO = new Date(parseDateAndTime(startDate, startTime)).toISOString()
    const endAtISO = (endDate && endTime) ? new Date(parseDateAndTime(endDate, endTime)).toISOString() : undefined

    setIsSubmitting(true)
    try {
      if (event) {
        // Update existing event
        await updateEvent({
          id: event.id,
          title: title.trim(),
          start_at: startAtISO,
          end_at: endAtISO,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      } else {
        // Create new event
        await createEvent({
          title: title.trim(),
          start_at: startAtISO,
          end_at: endAtISO,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      }
      onSuccess()
    } catch (error) {
      console.error(`Failed to ${event ? 'update' : 'create'} event:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pl-8">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">Start</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">End (optional)</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>
      <Input
        label="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors resize-none"
          rows={3}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (event ? 'Updating...' : 'Creating...') : (event ? 'Update Event' : 'Create Event')}
        </Button>
        <Button type="button" onClick={onCancel} variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  )
}

