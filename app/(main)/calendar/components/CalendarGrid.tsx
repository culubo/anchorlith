'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Event } from '@/lib/queries/events'
import { formatDate, formatTime } from '@/lib/utils/date'

interface CalendarGridProps {
  events: Event[]
}

export function CalendarGrid({ events }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Get events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    const dateStr = formatDate(date.toISOString())
    return events.filter(event => {
      const eventDate = formatDate(event.start_at)
      return eventDate === dateStr
    })
  }

  // Generate calendar days
  const calendarDays: (Date | null)[] = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={goToPreviousMonth}
            className="text-text-secondary hover:text-text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Previous month"
          >
            ←
          </button>
          <h2 className="text-lg sm:text-xl text-text-primary">
            <span className="hidden sm:inline">{monthNames[month]} {year}</span>
            <span className="sm:hidden">{monthNames[month].substring(0, 3)} {year}</span>
          </h2>
          <button
            onClick={goToNextMonth}
            className="text-text-secondary hover:text-text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Next month"
          >
            →
          </button>
        </div>
        <button
          onClick={goToToday}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] px-3"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-border-subtle overflow-x-auto">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div
            key={day}
            className="bg-bg-primary p-1 sm:p-2 text-center text-[10px] sm:text-xs font-medium text-text-secondary"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="bg-bg-primary min-h-[60px] sm:min-h-[100px] p-1 sm:p-2"
              />
            )
          }

          const dayEvents = getEventsForDate(date)
          const isToday =
            date.toDateString() === new Date().toDateString()
          const dayNumber = date.getDate()

          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-bg-primary min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border border-border-subtle ${
                isToday ? 'ring-2 ring-text-primary' : ''
              }`}
            >
              <div
                className={`text-xs sm:text-sm mb-0.5 sm:mb-1 ${
                  isToday
                    ? 'font-semibold text-text-primary'
                    : 'text-text-secondary'
                }`}
              >
                {dayNumber}
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                {dayEvents.slice(0, isMobile ? 1 : 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-[10px] sm:text-xs text-text-primary bg-bg-secondary px-1 sm:px-1.5 py-0.5 rounded truncate"
                    title={event.title}
                  >
                    <span className="hidden sm:inline">{formatTime(event.start_at)} </span>
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > (isMobile ? 1 : 3) && (
                  <div className="text-[10px] sm:text-xs text-text-tertiary">
                    +{dayEvents.length - (isMobile ? 1 : 3)} more
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

