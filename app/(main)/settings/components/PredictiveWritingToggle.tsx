'use client'

import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'

export default function PredictiveWritingToggle() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('predictiveWritingOptIn') === 'true'
    } catch {
      return false
    }
  })

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setEnabled(checked)
    try {
      localStorage.setItem('predictiveWritingOptIn', checked ? 'true' : 'false')
    } catch (err) {
      console.error('Failed to save predictive writing preference', err)
    }
  }

  return (
    <div className="pl-8">
      <h3 className="text-lg mb-4 text-text-primary">Predictive writing</h3>
      <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
        <p>
          Enable server-assisted suggestions for notes. When enabled, you can request a suggestion for continuing or improving a note; the content is sent to the server AI endpoint. This feature requires an API key to be configured on the server.
        </p>
        <div className="mt-3">
          <Checkbox checked={enabled} onChange={onChange} label="Enable predictive writing" />
        </div>
      </div>
    </div>
  )
}
