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
  // Format date for datetime-local input
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const getInitialStartDate = (): string => {
    if (prefilledDate) {
      return formatDateForInput(prefilledDate)
    }
    if (event?.start_at) {
      return formatDateForInput(new Date(event.start_at))
    }
    return ''
  }

  const getInitialEndDate = (): string => {
    if (event?.end_at) {
      return formatDateForInput(new Date(event.end_at))
    }
    return ''
  }

  const [title, setTitle] = useState(event?.title || '')
  const [startAt, setStartAt] = useState(getInitialStartDate())
  const [endAt, setEndAt] = useState(getInitialEndDate())
  const [location, setLocation] = useState(event?.location || '')
  const [notes, setNotes] = useState(event?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      setStartAt(event.start_at ? formatDateForInput(new Date(event.start_at)) : '')
      setEndAt(event.end_at ? formatDateForInput(new Date(event.end_at)) : '')
      setLocation(event.location || '')
      setNotes(event.notes || '')
    }
  }, [event])

  // Update startAt when prefilledDate changes
  useEffect(() => {
    if (prefilledDate) {
      setStartAt(formatDateForInput(prefilledDate))
    }
  }, [prefilledDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startAt) return

    setIsSubmitting(true)
    try {
      if (event) {
        // Update existing event
        await updateEvent({
          id: event.id,
          title: title.trim(),
          start_at: new Date(startAt).toISOString(),
          end_at: endAt ? new Date(endAt).toISOString() : undefined,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      } else {
        // Create new event
        await createEvent({
          title: title.trim(),
          start_at: new Date(startAt).toISOString(),
          end_at: endAt ? new Date(endAt).toISOString() : undefined,
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
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start"
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          required
        />
        <Input
          label="End (optional)"
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
        />
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

