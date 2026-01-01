'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { createTodo, updateTodo } from '../../todos/actions'
import { motion } from 'framer-motion'
import type { Todo } from '@/lib/queries/todos'

interface TasksSectionProps {
  tasks: Todo[]
}

export function TasksSection({ tasks: initialTasks }: TasksSectionProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    try {
      const newTask = await createTodo({
        title: newTaskTitle.trim(),
        due_at: today.toISOString(),
      })
      setTasks([...tasks, newTask as Todo])
      setNewTaskTitle('')
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleToggleTask = async (task: Todo) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      const updated = await updateTodo({
        id: task.id,
        status: newStatus,
      })
      setTasks(tasks.map((t) => (t.id === task.id ? (updated as Todo) : t)))
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const pendingTasks = tasks.filter((t) => t.status === 'pending')

  return (
    <div className="space-y-3">
      <form onSubmit={handleAddTask} className="pl-8">
        <Input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task..."
          className="text-sm"
        />
      </form>

      {pendingTasks.length === 0 ? (
        <div className="pl-8">
          <p className="text-sm text-text-tertiary">No tasks</p>
        </div>
      ) : (
        <div className="space-y-2 pl-8">
          {pendingTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Checkbox
                checked={task.status === 'completed'}
                onChange={() => handleToggleTask(task)}
                label={task.title}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

