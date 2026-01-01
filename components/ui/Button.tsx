'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'default' | 'ghost'
  className?: string
}

export function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'default',
  className = '',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { opacity: 0.7 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`
        ${variant === 'ghost' ? 'text-text-secondary hover:text-text-primary' : 'text-text-primary'}
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}

