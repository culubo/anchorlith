'use client'

import { useState, useRef, useEffect } from 'react'
import { formatDate } from '@/lib/utils/date'

interface CommandEditorProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
  disabled?: boolean
}

export function CommandEditor({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
}: CommandEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [convertedLines, setConvertedLines] = useState<Set<number>>(new Set())

  // Detect command at cursor position
  const getCommandAtCursor = (text: string, cursorPos: number) => {
    const lines = text.split('\n')
    let charCount = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineStart = charCount
      const lineEnd = charCount + line.length
      
      if (cursorPos >= lineStart && cursorPos <= lineEnd) {
        const trimmed = line.trim()
        const commandStart = line.indexOf('/')
        
        if (commandStart !== -1 && trimmed.startsWith('/')) {
          const commandEnd = line.indexOf(' ', commandStart)
          const command = commandEnd !== -1 
            ? line.substring(commandStart, commandEnd)
            : line.substring(commandStart)
          
          if (command === '/todo' || command === '/list' || command === '/calendar') {
            return {
              lineIndex: i,
              command,
              commandStart: lineStart + commandStart,
              commandEnd: commandEnd !== -1 ? lineStart + commandEnd : lineEnd,
            }
          }
        }
        break
      }
      charCount += line.length + 1 // +1 for newline
    }
    return null
  }

  // Check if a line should be converted to a box
  const shouldConvertLine = (lineIndex: number, line: string): boolean => {
    if (convertedLines.has(lineIndex)) return true
    const trimmed = line.trim()
    return (
      (trimmed.startsWith('/todo ') && trimmed.length > 6) ||
      (trimmed.startsWith('/list ') && trimmed.length > 6) ||
      (trimmed.startsWith('/calendar ') && trimmed.length > 10)
    )
  }

  // Parse command from a line
  const parseCommand = (line: string): { type: 'todo' | 'list' | 'calendar' | null; content: string } => {
    const trimmed = line.trim()
    if (trimmed.startsWith('/todo ')) {
      return { type: 'todo', content: trimmed.substring(6).trim() }
    }
    if (trimmed.startsWith('/list ')) {
      return { type: 'list', content: trimmed.substring(6).trim() }
    }
    if (trimmed.startsWith('/calendar ')) {
      return { type: 'calendar', content: trimmed.substring(10).trim() }
    }
    return { type: null, content: '' }
  }

  // Get the command type of a line (if it's a todo/list)
  const getLineCommandType = (line: string): 'todo' | 'list' | null => {
    const trimmed = line.trim()
    if (trimmed.startsWith('/todo ')) return 'todo'
    if (trimmed.startsWith('/list ')) return 'list'
    return null
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Handle Enter key for todo/list continuation
    if (e.key === 'Enter') {
      const cursorPos = textarea.selectionStart
      const lines = value.split('\n')
      let charCount = 0
      let currentLineIndex = -1
      
      // Find which line the cursor is on
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length
        if (cursorPos >= charCount && cursorPos <= charCount + lineLength) {
          currentLineIndex = i
          break
        }
        charCount += lineLength + 1 // +1 for newline
      }

      if (currentLineIndex >= 0) {
        const currentLine = lines[currentLineIndex]
        const commandType = getLineCommandType(currentLine)
        const isConverted = convertedLines.has(currentLineIndex)
        
        // Check if we're on a todo/list line (converted or not)
        if (commandType === 'todo' || commandType === 'list') {
          // Get leading spaces from current line
          const leadingSpaces = currentLine.match(/^(\s*)/)?.[1] || ''
          
          // Check if current line has content (more than just the command)
          const trimmed = currentLine.trim()
          const hasContent = 
            (commandType === 'todo' && trimmed.length > 6) ||
            (commandType === 'list' && trimmed.length > 6)
          
          // If has content, create new item (whether converted or not)
          if (hasContent) {
            e.preventDefault()
            
            // Create a new todo/list item on the next line
            const newLine = `${leadingSpaces}/${commandType} `
            const newLines = [...lines]
            newLines.splice(currentLineIndex + 1, 0, newLine)
            const newValue = newLines.join('\n')
            
            // Calculate new cursor position (after the new command)
            const newCursorPos = charCount + currentLine.length + 1 + newLine.length
            
            onChange(newValue)
            
            // Mark both current and new line as converted
            setConvertedLines(prev => {
              const newSet = new Set(prev)
              newSet.add(currentLineIndex)
              newSet.add(currentLineIndex + 1)
              return newSet
            })
            
            // Set cursor position after the command
            setTimeout(() => {
              if (textarea) {
                textarea.setSelectionRange(newCursorPos, newCursorPos)
              }
            }, 0)
            
            return
          } else if (isConverted && !hasContent) {
            // Converted but empty - end the todo/list sequence
            e.preventDefault()
            
            // Remove the command and go to normal text
            const newLine = leadingSpaces
            const newLines = [...lines]
            newLines[currentLineIndex] = newLine
            const newValue = newLines.join('\n')
            
            // Remove from converted lines
            setConvertedLines(prev => {
              const newSet = new Set(prev)
              newSet.delete(currentLineIndex)
              return newSet
            })
            
            // Calculate new cursor position
            const newCursorPos = charCount + newLine.length
            
            onChange(newValue)
            
            // Set cursor position
            setTimeout(() => {
              if (textarea) {
                textarea.setSelectionRange(newCursorPos, newCursorPos)
              }
            }, 0)
            
            return
          }
        }
      }
    }

    // Don't convert on Delete/Backspace - let user edit the command
    if (e.key === 'Backspace' || e.key === 'Delete') {
      onKeyDown?.(e)
      return
    }

    // For any other key, check if we should convert after the key is processed
    // We'll do this in a setTimeout to let the value update first
    setTimeout(() => {
      const cursorPos = textarea.selectionStart
      const currentValue = textarea.value
      const commandInfo = getCommandAtCursor(currentValue, cursorPos)

      if (commandInfo) {
        const lines = currentValue.split('\n')
        const line = lines[commandInfo.lineIndex]
        const trimmed = line.trim()
        
        // Check if the command has content after it
        const hasContent = 
          (commandInfo.command === '/todo' && trimmed.startsWith('/todo ') && trimmed.length > 6) ||
          (commandInfo.command === '/list' && trimmed.startsWith('/list ') && trimmed.length > 6) ||
          (commandInfo.command === '/calendar' && trimmed.startsWith('/calendar ') && trimmed.length > 10)

        if (hasContent && !convertedLines.has(commandInfo.lineIndex)) {
          // Mark this line as converted
          setConvertedLines(prev => new Set([...prev, commandInfo.lineIndex]))
        }
      }
    }, 0)

    // Call parent's onKeyDown handler
    onKeyDown?.(e)
  }

  // Render text with command highlighting and boxes
  const renderHighlightedText = () => {
    if (!value) return null

    const lines = value.split('\n')
    const parts: JSX.Element[] = []

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim()
      const isConverted = convertedLines.has(lineIndex) && shouldConvertLine(lineIndex, line)
      const command = parseCommand(line)

      // If line is converted, render as box
      if (isConverted && command.type) {
        const leadingSpaces = line.match(/^(\s*)/)?.[1] || ''
        
        if (command.type === 'todo') {
          parts.push(
            <div key={`line-${lineIndex}`} className="flex items-start gap-3">
              <span className="whitespace-pre">{leadingSpaces}</span>
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5 w-4 h-4 border border-text-secondary rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-text-primary rounded-sm opacity-0" />
                </div>
                <span className="flex-1">{command.content}</span>
              </div>
            </div>
          )
        } else if (command.type === 'list') {
          parts.push(
            <div key={`line-${lineIndex}`} className="flex items-start gap-3">
              <span className="whitespace-pre">{leadingSpaces}</span>
              <div className="flex items-start gap-3 flex-1">
                <span className="text-text-primary mt-1">•</span>
                <span className="flex-1">{command.content}</span>
              </div>
            </div>
          )
        } else if (command.type === 'calendar') {
          let displayDate = command.content
          try {
            const date = new Date(displayDate)
            if (!isNaN(date.getTime())) {
              displayDate = formatDate(date.toISOString())
            }
          } catch (e) {
            // Use as-is if parsing fails
          }
          parts.push(
            <div key={`line-${lineIndex}`} className="flex items-start gap-3">
              <span className="whitespace-pre">{leadingSpaces}</span>
              <div className="flex items-start gap-3 flex-1">
                <span className="text-text-secondary">📅 </span>
                <span className="flex-1">{displayDate}</span>
              </div>
            </div>
          )
        }
      } else {
        // Render with subtle color highlighting for commands
        let hasCommand = false

        if (trimmed.startsWith('/todo ')) {
          const commandMatch = line.match(/^(\s*)(\/todo\s*)(.*)$/)
          if (commandMatch) {
            const [, leadingSpaces, command, rest] = commandMatch
            parts.push(
              <span key={`line-${lineIndex}`}>
                {leadingSpaces}
                <span className="text-text-secondary opacity-70">{command}</span>
                {rest}
              </span>
            )
            hasCommand = true
          }
        } else if (trimmed.startsWith('/list ')) {
          const commandMatch = line.match(/^(\s*)(\/list\s*)(.*)$/)
          if (commandMatch) {
            const [, leadingSpaces, command, rest] = commandMatch
            parts.push(
              <span key={`line-${lineIndex}`}>
                {leadingSpaces}
                <span className="text-text-secondary opacity-70">{command}</span>
                {rest}
              </span>
            )
            hasCommand = true
          }
        } else if (trimmed.startsWith('/calendar ')) {
          const commandMatch = line.match(/^(\s*)(\/calendar\s*)(.*)$/)
          if (commandMatch) {
            const [, leadingSpaces, command, rest] = commandMatch
            parts.push(
              <span key={`line-${lineIndex}`}>
                {leadingSpaces}
                <span className="text-text-secondary opacity-70">{command}</span>
                {rest}
              </span>
            )
            hasCommand = true
          }
        }

        if (!hasCommand) {
          parts.push(<span key={`line-${lineIndex}`}>{line}</span>)
        }
      }

      if (lineIndex < lines.length - 1) {
        parts.push(<br key={`br-${lineIndex}`} />)
      }
    })

    return parts
  }

  // Reset converted lines when value changes significantly (e.g., new note)
  useEffect(() => {
    const lines = value.split('\n')
    const newConvertedLines = new Set<number>()
    lines.forEach((line, index) => {
      if (convertedLines.has(index)) {
        const trimmed = line.trim()
        const stillValid = 
          (trimmed.startsWith('/todo ') && trimmed.length > 6) ||
          (trimmed.startsWith('/list ') && trimmed.length > 6) ||
          (trimmed.startsWith('/calendar ') && trimmed.length > 10)
        if (stillValid) {
          newConvertedLines.add(index)
        }
      }
    })
    if (newConvertedLines.size !== convertedLines.size) {
      setConvertedLines(newConvertedLines)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="relative w-full h-full">
      {/* Hidden textarea for input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setCursorPosition(e.target.selectionStart)
        }}
        onKeyDown={handleKeyDown}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement
          setCursorPosition(target.selectionStart)
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="absolute inset-0 w-full h-full p-0 bg-transparent border-0 resize-none focus:outline-none text-text-primary placeholder:text-text-tertiary disabled:opacity-50 opacity-0 z-10 caret-text-primary"
        style={{ color: 'transparent' }}
      />
      {/* Visible overlay with syntax highlighting */}
      <div
        className="absolute inset-0 w-full h-full p-0 pointer-events-none whitespace-pre-wrap break-words text-text-primary"
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          padding: 'inherit',
        }}
      >
        {renderHighlightedText() || (
          <span className="text-text-tertiary">{placeholder}</span>
        )}
      </div>
    </div>
  )
}

