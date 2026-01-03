'use client'

import { Checkbox } from '@/components/ui/Checkbox' 
import { formatDate } from '@/lib/utils/date'
import { DraggableImage } from '@/components/DraggableImage'

interface CommandPreviewProps {
  content: string
  onToggleTodo?: (lineIndex: number) => void
  todoStates?: Record<number, boolean>
  onImagePositionChange?: (lineIndex: number, x: number, y: number) => void
  onContentUpdate?: (newContent: string) => void
}

interface ParsedLine {
  type: 'text' | 'todo' | 'list' | 'calendar' | 'image' | 'empty'
  content: string
  checked?: boolean
  calendarDate?: string
  imageUrl?: string
  imageId?: string
  imageX?: number
  imageY?: number
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
    
    // Check for /image command
    if (trimmed.startsWith('/image ')) {
      const imageContent = trimmed.substring(7).trim()
      // Parse image URL and optional position: /image url [x,y]
      const parts = imageContent.split(/\s+/)
      const imageUrl = parts[0]
      let imageX = 0
      let imageY = 0
      
      if (parts[1] && parts[1].match(/^\[\d+,\d+\]$/)) {
        const coords = parts[1].slice(1, -1).split(',')
        imageX = parseInt(coords[0], 10)
        imageY = parseInt(coords[1], 10)
      }
      
      return {
        type: 'image',
        content: imageContent,
        imageUrl,
        imageId: `img-${index}-${Date.now()}`,
        imageX,
        imageY,
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
  todoStates = {},
  onImagePositionChange,
  onContentUpdate,
}: CommandPreviewProps) {
  const parsed = parseContent(content)
  
  const handleImagePositionChange = (lineIndex: number, x: number, y: number) => {
    onImagePositionChange?.(lineIndex, x, y)
    
    // Update the content with new position
    if (onContentUpdate) {
      const lines = content.split('\n')
      const line = lines[lineIndex]
      if (line && line.trim().startsWith('/image ')) {
        const imageUrl = line.trim().substring(7).trim().split(/\s+/)[0]
        const newLine = `/image ${imageUrl} [${x},${y}]`
        lines[lineIndex] = newLine
        onContentUpdate(lines.join('\n'))
      }
    }
  }
  
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
          } catch {
            // Use as-is if parsing fails
          }
          return (
            <div key={index} className="pl-8">
              <span className="text-text-secondary">📅 </span>
              <span className="text-text-primary">{displayDate}</span>
            </div>
          )
        }
        
        if (line.type === 'image' && line.imageUrl) {
          return (
            <div key={index} className="pl-8 my-4">
              <DraggableImage
                src={line.imageUrl}
                alt=""
                id={line.imageId || `img-${index}`}
                initialX={line.imageX || 0}
                initialY={line.imageY || 0}
                onPositionChange={(id, x, y) => handleImagePositionChange(line.lineIndex, x, y)}
              />
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

