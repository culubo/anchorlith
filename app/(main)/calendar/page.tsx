'use client'

import { useState, useEffect } from 'react'
import { EventList } from './components/EventList'
import { CalendarGrid } from './components/CalendarGrid'
import { EventForm } from './components/EventForm'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import type { Event } from '@/lib/queries/events'

export default function CalendarPage() {
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) throw new Error('Failed to fetch events')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  const handleEventChange = () => {
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
    loadEvents()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl text-text-primary">Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Grid
            </button>
            <span className="text-text-tertiary">|</span>
            <button
              onClick={() => setViewMode('list')}
              className={`text-sm transition-colors ${
                viewMode === 'list'
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              List
            </button>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              New Event
            </Button>
          )}
        </div>
      </div>

      {showForm ? (
        <EventForm
          onSuccess={() => {
            setShowForm(false)
            handleEventChange()
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : loading ? (
        <div className="text-text-secondary">Loading...</div>
      ) : viewMode === 'grid' ? (
        <CalendarGrid events={events} />
      ) : (
        <EventList onEventChange={handleEventChange} />
      )}
    </motion.div>
  )
}

