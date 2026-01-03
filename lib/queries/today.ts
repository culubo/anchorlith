import { getEventsByDate } from './events'
import { getTodosByDate } from './todos'
import { getRemindersByDate } from './reminders' 

export async function getTodayData() {
  const today = new Date()
  
  const [events, todos, reminders] = await Promise.all([
    getEventsByDate(today),
    getTodosByDate(today),
    getRemindersByDate(today),
  ])

  // Combine events and reminders for schedule
  const schedule = [
    ...events.map((event) => ({
      id: event.id,
      type: 'event' as const,
      title: event.title,
      time: event.start_at,
      endTime: event.end_at,
      location: event.location,
      notes: event.notes,
    })),
    ...reminders.map((reminder) => ({
      id: reminder.id,
      type: 'reminder' as const,
      title: reminder.title,
      time: reminder.remind_at,
      endTime: null,
      location: null,
      notes: null,
    })),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  // Filter pending todos
  const tasks = todos.filter((todo) => todo.status === 'pending')

  return {
    schedule,
    tasks,
    date: today,
  }
}

