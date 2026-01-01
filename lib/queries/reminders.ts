import { createClient } from '@/lib/supabase/server'

export interface Reminder {
  id: string
  user_id: string
  title: string
  remind_at: string
  created_at: string
  updated_at: string
}

export async function getReminders() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('remind_at', { ascending: true })

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

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .gte('remind_at', startOfDay.toISOString())
    .lte('remind_at', endOfDay.toISOString())
    .order('remind_at', { ascending: true })

  if (error) throw error
  return data as Reminder[]
}

