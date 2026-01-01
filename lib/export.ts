import { createClient } from '@/lib/supabase/server'

export async function exportUserData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Fetch all user data
  const [notes, todos, events, reminders, files, publicPages] = await Promise.all([
    supabase.from('notes').select('*').eq('user_id', user.id),
    supabase.from('todos').select('*').eq('user_id', user.id),
    supabase.from('events').select('*').eq('user_id', user.id),
    supabase.from('reminders').select('*').eq('user_id', user.id),
    supabase.from('files').select('*').eq('user_id', user.id),
    supabase.from('public_pages').select('*').eq('user_id', user.id),
  ])

  return {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    user_email: user.email,
    notes: notes.data || [],
    todos: todos.data || [],
    events: events.data || [],
    reminders: reminders.data || [],
    files: files.data || [],
    public_pages: publicPages.data || [],
  }
}

