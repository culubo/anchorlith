'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateNoteInput, UpdateNoteInput } from '@/lib/actions/types'

export async function createNote(input: CreateNoteInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: input.title,
      body_md: input.body_md || null,
      tags: input.tags || [],
      linked_date: input.linked_date || null,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/notes')
  return data
}

export async function updateNote(input: UpdateNoteInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const updateData: any = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.body_md !== undefined) updateData.body_md = input.body_md
  if (input.tags !== undefined) updateData.tags = input.tags
  if (input.linked_date !== undefined) updateData.linked_date = input.linked_date

  const { data, error } = await supabase
    .from('notes')
    .update(updateData)
    .eq('id', input.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/notes')
  return data
}

export async function deleteNote(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/notes')
}

