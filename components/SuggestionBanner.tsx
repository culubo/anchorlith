'use client'

import { useState } from 'react'
import { Button } from './ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

interface SuggestionBannerProps {
  message: string
  onAccept: () => void
  onDismiss: () => void
}

export function SuggestionBanner({
  message,
  onAccept,
  onDismiss,
}: SuggestionBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleAccept = () => {
    onAccept()
    setIsVisible(false)
  }

  const handleDismiss = () => {
    onDismiss()
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-bg-secondary border border-border-subtle p-4 rounded mb-4"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-text-primary flex-1">{message}</p>
            <div className="flex items-center gap-2">
              <Button onClick={handleAccept} className="text-sm">
                Accept
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="text-sm"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

