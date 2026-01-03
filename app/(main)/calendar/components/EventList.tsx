'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Event } from '@/lib/queries/events'
import { formatDate, formatTime, formatDateTime } from '@/lib/utils/date'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { deleteEvent } from '../actions'
import { EventForm } from './EventForm'

interface EventListProps {
  onEventChange?: () => void
}

export function EventList({ onEventChange }: EventListProps = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
      onEventChange?.()
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }, [onEventChange])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleDelete = async (eventId: string) => {
    if (!confirm('Delete this event?')) return
    try {
      await deleteEvent(eventId)
      loadEvents()
      onEventChange?.()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  if (editingEvent) {
    return (
      <EventForm
        event={editingEvent}
        onSuccess={() => {
          setEditingEvent(null)
          loadEvents()
          onEventChange?.()
        }}
        onCancel={() => setEditingEvent(null)}
      />
    )
  }

  if (loading) {
    return <div className="text-text-secondary">Loading...</div>
  }

  if (events.length === 0) {
    return (
      <div className="pl-8">
        <p className="text-sm text-text-tertiary">No events</p>
      </div>
    )
  }

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = formatDate(event.start_at)
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  return (
    <div className="space-y-8">
      {Object.entries(eventsByDate).map(([date, dateEvents]) => (
        <div key={date} className="pl-8">
          <h3 className="text-base font-medium text-text-primary mb-4">{date}</h3>
          <div className="space-y-4">
            {dateEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4"
              >
                <div className="text-xs text-text-tertiary min-w-[80px]">
                  {formatTime(event.start_at)}
                  {event.end_at && ` - ${formatTime(event.end_at)}`}
                </div>
                <div className="flex-1">
                  <h4 className="text-base text-text-primary">{event.title}</h4>
                  {event.location && (
                    <p className="text-sm text-text-secondary mt-1">
                      {event.location}
                    </p>
                  )}
                  {event.notes && (
                    <p className="text-sm text-text-tertiary mt-1">
                      {event.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setEditingEvent(event)}
                    variant="ghost"
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(event.id)}
                    variant="ghost"
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

