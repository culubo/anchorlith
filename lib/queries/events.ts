import { createClient } from '@/lib/supabase/server'

export interface Event {
  id: string
  user_id: string
  title: string
  start_at: string
  end_at: string | null
  location: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export async function getEvents() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('start_at', { ascending: true })

  if (error) throw error
  return data as Event[]
}

export async function getEventsByDate(date: Date) {
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
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_at', startOfDay.toISOString())
    .lte('start_at', endOfDay.toISOString())
    .order('start_at', { ascending: true })

  if (error) throw error
  return data as Event[]
}

export async function getUpcomingEvents(limit: number = 10) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as Event[]
}

