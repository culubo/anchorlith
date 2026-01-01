'use client'

import { motion } from 'framer-motion'
import { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  const checkbox = (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        {...props}
        className="sr-only"
      />
      <motion.div
        className={`
          w-4 h-4 border border-border-subtle
          flex items-center justify-center
          ${props.checked ? 'bg-text-primary border-text-primary' : 'bg-transparent'}
          transition-colors
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {props.checked && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 text-bg-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        )}
      </motion.div>
      {label && (
        <span className="text-text-primary group-hover:text-text-secondary transition-colors">
          {label}
        </span>
      )}
    </label>
  )

  return checkbox
}

