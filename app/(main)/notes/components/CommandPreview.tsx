'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { formatDate } from '@/lib/utils/date'

interface CommandPreviewProps {
  content: string
  onToggleTodo?: (lineIndex: number) => void
  todoStates?: Record<number, boolean>
}

interface ParsedLine {
  type: 'text' | 'todo' | 'list' | 'calendar' | 'empty'
  content: string
  checked?: boolean
  calendarDate?: string
  lineIndex: number
}

function parseContent(content: string): ParsedLine[] {
  const lines = content.split('\n')
  return lines.map((line, index) => {
    const trimmed = line.trim()
    
    if (!trimmed) {
      return { type: 'empty', content: '', lineIndex: index }
    }
    
    // Check for /todo command
    if (trimmed.startsWith('/todo ')) {
      const todoText = trimmed.substring(6).trim()
      return {
        type: 'todo',
        content: todoText,
        checked: false,
        lineIndex: index,
      }
    }
    
    // Check for /list command
    if (trimmed.startsWith('/list ')) {
      const listText = trimmed.substring(6).trim()
      return {
        type: 'list',
        content: listText,
        lineIndex: index,
      }
    }
    
    // Check for /calendar command
    if (trimmed.startsWith('/calendar ')) {
      const dateStr = trimmed.substring(10).trim()
      return {
        type: 'calendar',
        content: dateStr,
        calendarDate: dateStr,
        lineIndex: index,
      }
    }
    
    // Regular text
    return {
      type: 'text',
      content: line,
      lineIndex: index,
    }
  })
}

export function CommandPreview({ 
  content, 
  onToggleTodo, 
  todoStates = {} 
}: CommandPreviewProps) {
  const parsed = parseContent(content)
  
  return (
    <div className="space-y-2 text-text-primary">
      {parsed.map((line, index) => {
        if (line.type === 'empty') {
          return <div key={index} className="h-4" />
        }
        
        if (line.type === 'todo') {
          const isChecked = todoStates[line.lineIndex] || false
          return (
            <div key={index} className="flex items-start gap-3 pl-8">
              <Checkbox
                checked={isChecked}
                onChange={() => onToggleTodo?.(line.lineIndex)}
              />
              <span className={isChecked ? 'line-through text-text-tertiary opacity-60' : ''}>
                {line.content}
              </span>
            </div>
          )
        }
        
        if (line.type === 'list') {
          return (
            <div key={index} className="flex items-start gap-3 pl-8">
              <span className="text-text-primary mt-1">•</span>
              <span>{line.content}</span>
            </div>
          )
        }
        
        if (line.type === 'calendar') {
          let displayDate = line.calendarDate || line.content
          try {
            // Try to parse and format the date
            const date = new Date(displayDate)
            if (!isNaN(date.getTime())) {
              displayDate = formatDate(date.toISOString())
            }
          } catch (e) {
            // Use as-is if parsing fails
          }
          return (
            <div key={index} className="pl-8">
              <span className="text-text-secondary">📅 </span>
              <span className="text-text-primary">{displayDate}</span>
            </div>
          )
        }
        
        // Regular text
        return (
          <div key={index} className="pl-8">
            {line.content}
          </div>
        )
      })}
    </div>
  )
}

