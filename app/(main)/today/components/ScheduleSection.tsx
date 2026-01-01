'use client'

import { formatTime } from '@/lib/utils/date'
import { motion } from 'framer-motion'

interface ScheduleItem {
  id: string
  type: 'event' | 'reminder'
  title: string
  time: string
  endTime: string | null
  location: string | null
  notes: string | null
}

interface ScheduleSectionProps {
  items: ScheduleItem[]
}

export function ScheduleSection({ items }: ScheduleSectionProps) {
  if (items.length === 0) {
    return (
      <div className="pl-8">
        <p className="text-sm text-text-tertiary">No scheduled items</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex gap-4 pl-8 relative"
        >
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-text-primary" />
            {index < items.length - 1 && (
              <div className="w-px h-full min-h-[3rem] bg-border-subtle mt-2" />
            )}
          </div>

          <div className="flex-1 pb-4">
            <div className="flex items-baseline gap-3">
              <span className="text-xs text-text-tertiary">
                {formatTime(item.time)}
              </span>
              {item.endTime && (
                <span className="text-xs text-text-tertiary">
                  - {formatTime(item.endTime)}
                </span>
              )}
              <span className="text-base text-text-primary">{item.title}</span>
            </div>
            {item.location && (
              <p className="text-sm text-text-secondary mt-1 pl-16">
                {item.location}
              </p>
            )}
            {item.notes && (
              <p className="text-sm text-text-tertiary mt-1 pl-16">
                {item.notes}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

