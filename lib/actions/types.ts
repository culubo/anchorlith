export interface CreateNoteInput {
  title: string
  body_md?: string
  tags?: string[]
  linked_date?: string
}

export interface UpdateNoteInput {
  id: string
  title?: string
  body_md?: string
  tags?: string[]
  linked_date?: string | null
}

export interface CreateTodoInput {
  title: string
  due_at?: string
  priority?: number
  tags?: string[]
}

export interface UpdateTodoInput {
  id: string
  title?: string
  due_at?: string | null
  status?: 'pending' | 'completed'
  priority?: number | null
  tags?: string[]
}

export interface CreateEventInput {
  title: string
  start_at: string
  end_at?: string
  location?: string
  notes?: string
}

export interface UpdateEventInput {
  id: string
  title?: string
  start_at?: string
  end_at?: string | null
  location?: string | null
  notes?: string | null
}

export interface CreateReminderInput {
  title: string
  remind_at: string
  repeat_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  repeat_interval?: number
  repeat_end_date?: string | null
  repeat_count?: number | null
  event_id?: string | null
  is_completed?: boolean
}

export interface UpdateReminderInput {
  id: string
  title?: string
  remind_at?: string
  repeat_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  repeat_interval?: number
  repeat_end_date?: string | null
  repeat_count?: number | null
  event_id?: string | null
  is_completed?: boolean
}

