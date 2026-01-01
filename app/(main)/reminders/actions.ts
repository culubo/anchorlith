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

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: user.id,
      title: input.title,
      remind_at: input.remind_at,
    })
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

