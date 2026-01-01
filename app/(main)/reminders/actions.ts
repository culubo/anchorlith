'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateReminderInput, UpdateReminderInput } from '@/lib/actions/types'

export async function createReminder(input: CreateReminderInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const insertData: any = {
    user_id: user.id,
    title: input.title,
    remind_at: input.remind_at,
  }

  if (input.repeat_type !== undefined) insertData.repeat_type = input.repeat_type
  if (input.repeat_interval !== undefined) insertData.repeat_interval = input.repeat_interval
  if (input.repeat_end_date !== undefined) insertData.repeat_end_date = input.repeat_end_date
  if (input.repeat_count !== undefined) insertData.repeat_count = input.repeat_count
  if (input.event_id !== undefined) insertData.event_id = input.event_id
  if (input.is_completed !== undefined) insertData.is_completed = input.is_completed

  const { data, error } = await supabase
    .from('reminders')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/reminders')
  revalidatePath('/today')
  return data
}

export async function updateReminder(input: UpdateReminderInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const updateData: any = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.remind_at !== undefined) updateData.remind_at = input.remind_at
  if (input.repeat_type !== undefined) updateData.repeat_type = input.repeat_type
  if (input.repeat_interval !== undefined) updateData.repeat_interval = input.repeat_interval
  if (input.repeat_end_date !== undefined) updateData.repeat_end_date = input.repeat_end_date
  if (input.repeat_count !== undefined) updateData.repeat_count = input.repeat_count
  if (input.event_id !== undefined) updateData.event_id = input.event_id
  if (input.is_completed !== undefined) updateData.is_completed = input.is_completed

  const { data, error } = await supabase
    .from('reminders')
    .update(updateData)
    .eq('id', input.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/reminders')
  revalidatePath('/today')
  return data
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/reminders')
  revalidatePath('/today')
}

