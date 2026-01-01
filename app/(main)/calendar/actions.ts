'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateEventInput, UpdateEventInput } from '@/lib/actions/types'

export async function createEvent(input: CreateEventInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: user.id,
      title: input.title,
      start_at: input.start_at,
      end_at: input.end_at || null,
      location: input.location || null,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/calendar')
  revalidatePath('/today')
  return data
}

export async function updateEvent(input: UpdateEventInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const updateData: any = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.start_at !== undefined) updateData.start_at = input.start_at
  if (input.end_at !== undefined) updateData.end_at = input.end_at
  if (input.location !== undefined) updateData.location = input.location
  if (input.notes !== undefined) updateData.notes = input.notes

  const { data, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', input.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/calendar')
  revalidatePath('/today')
  return data
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/calendar')
  revalidatePath('/today')
}

