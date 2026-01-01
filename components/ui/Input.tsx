import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  const input = (
    <input
      {...props}
      className={`
        w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle
        text-text-primary placeholder:text-text-tertiary
        focus:outline-none focus:border-text-primary
        transition-colors
        ${className}
      `}
    />
  )

  if (label) {
    return (
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          {label}
        </label>
        {input}
      </div>
    )
  }

  return input
}

