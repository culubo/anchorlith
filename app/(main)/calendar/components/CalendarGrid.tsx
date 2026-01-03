'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Event } from '@/lib/queries/events'
import { formatDate, formatTime } from '@/lib/utils/date'
import { EventPopup } from './EventPopup'

interface CalendarGridProps {
  events: Event[]
  onAddEvent?: (date: Date) => void
  onEventChange?: () => void
}

export function CalendarGrid({ events, onAddEvent, onEventChange }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  const handleAddEvent = (date: Date) => {
    if (onAddEvent) {
      onAddEvent(date)
    }
  }

  const handleViewEvents = (date: Date) => {
    setSelectedDate(date)
  }

  const handleClosePopup = () => {
    setSelectedDate(null)
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <motion.button
            onClick={goToPreviousMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-text-secondary hover:text-text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Previous month"
          >
            <motion.span
              key={`prev-${year}-${month}`}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              ←
            </motion.span>
          </motion.button>
          <AnimatePresence mode="wait">
            <motion.h2
              key={`month-${year}-${month}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="text-lg sm:text-xl text-text-primary min-w-[120px] sm:min-w-[200px] text-center"
            >
              <span className="hidden sm:inline">{monthNames[month]} {year}</span>
              <span className="sm:hidden">{monthNames[month].substring(0, 3)} {year}</span>
            </motion.h2>
          </AnimatePresence>
          <motion.button
            onClick={goToNextMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-text-secondary hover:text-text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Next month"
          >
            <motion.span
              key={`next-${year}-${month}`}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </motion.button>
        </div>
        <motion.button
          onClick={goToToday}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] px-3"
        >
          Today
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`grid-${year}-${month}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-px bg-border-subtle overflow-x-auto"
        >
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

              const isHovered = hoveredDate?.toDateString() === date.toDateString()
              const hasEvents = dayEvents.length > 0

          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onHoverStart={() => !isMobile && setHoveredDate(date)}
              onHoverEnd={() => !isMobile && setHoveredDate(null)}
              onTouchStart={() => isMobile && setHoveredDate(hoveredDate?.toDateString() === date.toDateString() ? null : date)}
              className={`bg-bg-primary min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border border-border-subtle relative group ${
                isToday ? 'ring-2 ring-text-primary' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-0.5 sm:mb-1">
                <div
                  className={`text-xs sm:text-sm ${
                    isToday
                      ? 'font-semibold text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {dayNumber}
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (hasEvents) {
                          handleViewEvents(date)
                        } else if (onAddEvent) {
                          handleAddEvent(date)
                        }
                      }}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors shadow-sm z-10 ${
                        hasEvents
                          ? 'bg-text-secondary text-bg-primary hover:bg-text-primary'
                          : 'bg-text-primary text-bg-primary hover:bg-text-secondary'
                      }`}
                      aria-label={hasEvents ? 'View events' : 'Add event'}
                      title={hasEvents ? 'View events' : 'Add event'}
                    >
                      {hasEvents ? '📅' : '+'}
                    </motion.button>
                  )}
                </AnimatePresence>
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
        </motion.div>
      </AnimatePresence>

      {/* Event Popup */}
      {selectedDate && (
        <EventPopup
          events={getEventsForDate(selectedDate)}
          date={selectedDate}
          onClose={handleClosePopup}
          onEventChange={onEventChange}
        />
      )}
    </div>
  )
}

