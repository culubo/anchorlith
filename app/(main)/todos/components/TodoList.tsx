'use client'

import { useState, useEffect } from 'react'
import { TodoItem } from './TodoItem'
import { TodoFilters, FilterType } from './TodoFilters'
import { Input } from '@/components/ui/Input'
import { createTodo } from '../actions'
import type { Todo } from '@/lib/queries/todos'
import { isDateToday } from '@/lib/utils/date'
import { motion, AnimatePresence } from 'framer-motion'

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)

  const loadTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (!response.ok) throw new Error('Failed to fetch todos')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      await createTodo({
        title: newTaskTitle.trim(),
      })
      setNewTaskTitle('')
      loadTodos()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === 'all') return true
      if (filter === 'completed') return todo.status === 'completed'
      if (filter === 'today') {
        return todo.status === 'pending' && todo.due_at && isDateToday(todo.due_at)
      }
      if (filter === 'upcoming') {
        return (
          todo.status === 'pending' &&
          todo.due_at &&
          new Date(todo.due_at) > new Date() &&
          !isDateToday(todo.due_at)
        )
      }
      return true
    })
    .sort((a, b) => {
      // Sort: pending first, completed last
      if (a.status === 'completed' && b.status === 'pending') return 1
      if (a.status === 'pending' && b.status === 'completed') return -1
      // Within same status, maintain original order
      return 0
    })

  if (loading) {
    return <div className="text-text-secondary">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <TodoFilters activeFilter={filter} onFilterChange={setFilter} />

      <form onSubmit={handleAddTask} className="pl-8">
        <Input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task... (Press Enter)"
          className="text-sm"
        />
      </form>

      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="pl-8">
            <p className="text-sm text-text-tertiary">No tasks</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTodos.map((todo, index) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={loadTodos}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

