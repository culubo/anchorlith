import { createClient } from '@/lib/supabase/server'

export interface Reminder {
  id: string
  user_id: string
  title: string
  remind_at: string
  repeat_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  repeat_interval: number
  repeat_end_date: string | null
  repeat_count: number | null
  event_id: string | null
  is_completed: boolean
  last_reminded_at: string | null
  created_at: string
  updated_at: string
}

export async function getReminders() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const query = supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('remind_at', { ascending: true })

  // Try to filter by is_completed if column exists
  const { data, error } = await query.eq('is_completed', false)

  // If column doesn't exist, query without filter and add defaults
  if (error && (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist'))) {
    const { data: dataWithoutFilter, error: errorWithoutFilter } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('remind_at', { ascending: true })

    if (errorWithoutFilter) throw errorWithoutFilter

    // Map to new format with defaults
    return (dataWithoutFilter || []).map((reminder: any) => ({
      ...reminder,
      repeat_type: null,
      repeat_interval: 1,
      repeat_end_date: null,
      repeat_count: null,
      event_id: null,
      is_completed: false,
      last_reminded_at: null,
    })) as Reminder[]
  }

  if (error) throw error
  return data as Reminder[]
}

export async function getRemindersByDate(date: Date) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // Get all reminders (including repeating ones)
  const query = supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('remind_at', { ascending: true })

  // Try to filter by is_completed if column exists
  const { data: allReminders, error } = await query.eq('is_completed', false)

  // If column doesn't exist, query without filter and add defaults
  let reminders: Reminder[]
  if (error && (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist'))) {
    const { data: dataWithoutFilter, error: errorWithoutFilter } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('remind_at', { ascending: true })

    if (errorWithoutFilter) throw errorWithoutFilter

    // Map to new format with defaults
    reminders = (dataWithoutFilter || []).map((reminder: any) => ({
      ...reminder,
      repeat_type: null,
      repeat_interval: 1,
      repeat_end_date: null,
      repeat_count: null,
      event_id: null,
      is_completed: false,
      last_reminded_at: null,
    })) as Reminder[]
  } else {
    if (error) throw error
    reminders = allReminders as Reminder[]
  }

  // Filter reminders that should appear on this date
  const remindersForDate: Reminder[] = []
  
  for (const reminder of reminders) {
    const remindAt = new Date(reminder.remind_at)
    
    // Check if it's a one-time reminder for this date
    if (!reminder.repeat_type) {
      if (remindAt >= startOfDay && remindAt <= endOfDay) {
        remindersForDate.push(reminder)
      }
      continue
    }

    // For repeating reminders, check if they should appear on this date
    if (remindAt > endOfDay) continue // Hasn't started yet
    
    // Check if repeat has ended
    if (reminder.repeat_end_date) {
      const endDate = new Date(reminder.repeat_end_date)
      if (endDate < startOfDay) continue
    }

    // Calculate if this date matches the repeat pattern
    const shouldShow = calculateNextOccurrence(
      remindAt,
      reminder.repeat_type,
      reminder.repeat_interval,
      startOfDay,
      endOfDay,
      reminder.repeat_end_date ? new Date(reminder.repeat_end_date) : null
    )

    if (shouldShow) {
      remindersForDate.push(reminder)
    }
  }

  return remindersForDate.sort((a, b) => 
    new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime()
  )
}

// Helper function to calculate if a repeating reminder should appear on a given date
function calculateNextOccurrence(
  startDate: Date,
  repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number,
  checkStart: Date,
  checkEnd: Date,
  endDate: Date | null
): boolean {
  if (endDate && endDate < checkStart) return false

  let current = new Date(startDate)
  const checkDate = new Date(checkStart)
  checkDate.setHours(0, 0, 0, 0)

  while (current <= checkEnd) {
    if (endDate && current > endDate) break

    const currentDate = new Date(current)
    currentDate.setHours(0, 0, 0, 0)

    if (currentDate.getTime() === checkDate.getTime()) {
      return true
    }

    // Calculate next occurrence
    switch (repeatType) {
      case 'daily':
        current.setDate(current.getDate() + interval)
        break
      case 'weekly':
        current.setDate(current.getDate() + (7 * interval))
        break
      case 'monthly':
        current.setMonth(current.getMonth() + interval)
        break
      case 'yearly':
        current.setFullYear(current.getFullYear() + interval)
        break
    }

    if (current > checkEnd) break
  }

  return false
}

