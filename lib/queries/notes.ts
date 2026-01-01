import { createClient } from '@/lib/supabase/server'

export interface Note {
  id: string
  user_id: string
  title: string
  body_md: string | null
  tags: string[]
  linked_date: string | null
  created_at: string
  updated_at: string
}

export async function getNotes() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as Note[]
}

export async function getNote(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data as Note
}

export async function searchNotes(query: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .or(`title.ilike.%${query}%,body_md.ilike.%${query}%`)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as Note[]
}

