'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateTodo, deleteTodo } from '../actions'
import { formatDate, formatRelativeTime } from '@/lib/utils/date'
import { motion, AnimatePresence } from 'framer-motion'
import type { Todo } from '@/lib/queries/todos'

interface TodoItemProps {
  todo: Todo
  onUpdate: () => void
}

export function TodoItem({ todo, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async () => {
    setIsUpdating(true)
    try {
      await updateTodo({
        id: todo.id,
        status: todo.status === 'completed' ? 'pending' : 'completed',
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to update todo:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) return

    setIsUpdating(true)
    try {
      await updateTodo({
        id: todo.id,
        title: title.trim(),
      })
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to update todo:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return

    try {
      await deleteTodo(todo.id)
      onUpdate()
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 pl-8">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setTitle(todo.title)
              setIsEditing(false)
            }
          }}
          className="flex-1"
          autoFocus
        />
        <Button onClick={handleSave} disabled={isUpdating} className="text-sm">
          Save
        </Button>
        <Button
          onClick={() => {
            setTitle(todo.title)
            setIsEditing(false)
          }}
          variant="ghost"
          className="text-sm"
        >
          Cancel
        </Button>
      </div>
    )
  }

  const isCompleted = todo.status === 'completed'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: isCompleted ? 0.5 : 1,
        x: 0,
      }}
      exit={{ opacity: 0, height: 0 }}
      transition={{
        layout: { duration: 0.3, ease: 'easeInOut' },
        opacity: { duration: 0.3 },
      }}
      className="flex items-start gap-3 pl-8 group"
    >
      <Checkbox
        checked={isCompleted}
        onChange={handleToggle}
        disabled={isUpdating}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`
            text-base cursor-pointer relative overflow-hidden
            ${isCompleted
              ? 'text-text-tertiary'
              : 'text-text-primary'
            }
          `}
          onClick={() => !isCompleted && setIsEditing(true)}
        >
          <motion.span
            className="relative inline-block"
            initial={false}
            animate={{
              opacity: isCompleted ? 0.6 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            {todo.title}
          </motion.span>
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute top-1/2 left-0 right-0 h-px bg-text-tertiary origin-left"
                style={{ transform: 'translateY(-50%)' }}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
          {todo.due_at && (
            <span>{formatRelativeTime(todo.due_at)}</span>
          )}
          {todo.priority !== null && (
            <span>Priority: {todo.priority}</span>
          )}
          {todo.tags && todo.tags.length > 0 && (
            <span className="flex gap-1">
              {todo.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-text-primary w-5 h-5 flex items-center justify-center"
        aria-label="Delete task"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </motion.div>
  )
}

