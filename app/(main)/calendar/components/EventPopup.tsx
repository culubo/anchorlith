'use client'

/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Event } from '@/lib/queries/events'
import { formatDate, formatTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/Button'
import { deleteEvent } from '../actions'
import { EventForm } from './EventForm'

interface EventPopupProps {
  events: Event[]
  date: Date
  onClose: () => void
  onEventChange?: () => void
}

export function EventPopup({ events, date, onClose, onEventChange }: EventPopupProps) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevent body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleDelete = async (eventId: string) => {
    if (!confirm('Delete this event?')) return
    try {
      await deleteEvent(eventId)
      onEventChange?.()
      onClose()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  // Render edit form if editing
  if (editingEvent) {
    return (
      <AnimatePresence>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setEditingEvent(null)}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-bg-primary border border-border-subtle rounded-lg shadow-lg max-w-md w-full z-10"
          >
            <EventForm
              event={editingEvent}
              onSuccess={() => {
                setEditingEvent(null)
                onEventChange?.()
                onClose()
              }}
              onCancel={() => setEditingEvent(null)}
            />
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  // Render event list
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-bg-primary border border-border-subtle rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {formatDate(date.toISOString())}
              </h2>
              <p className="text-sm text-text-secondary">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center text-xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Events List */}
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-bg-secondary rounded border border-border-subtle"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-medium text-text-primary">
                    {event.title}
                  </h3>
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
                </div>
                <div className="space-y-1 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="text-text-tertiary">🕐</span>
                    <span>
                      {formatTime(event.start_at)}
                      {event.end_at && ` - ${formatTime(event.end_at)}`}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <span className="text-text-tertiary">📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.notes && (
                    <div className="mt-2 pt-2 border-t border-border-subtle">
                      <p className="text-text-secondary whitespace-pre-wrap">
                        {event.notes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

