import { createClient } from '@/lib/supabase/server'

export interface Todo {
  id: string
  user_id: string
  title: string
  due_at: string | null
  status: 'pending' | 'completed'
  priority: number | null
  tags: string[]
  created_at: string
  updated_at: string
}

export async function getTodos() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Todo[]
}

export async function getTodosByStatus(status: 'pending' | 'completed') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Todo[]
}

export async function getTodosByDate(date: Date) {
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
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .gte('due_at', startOfDay.toISOString())
    .lte('due_at', endOfDay.toISOString())
    .order('due_at', { ascending: true })

  if (error) throw error
  return data as Todo[]
}

export async function searchTodos(query: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .ilike('title', `%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Todo[]
}

