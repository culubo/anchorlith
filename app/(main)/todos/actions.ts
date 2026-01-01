'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateTodoInput, UpdateTodoInput } from '@/lib/actions/types'

export async function createTodo(input: CreateTodoInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: user.id,
      title: input.title,
      due_at: input.due_at || null,
      priority: input.priority || null,
      tags: input.tags || [],
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/todos')
  revalidatePath('/today')
  return data
}

export async function updateTodo(input: UpdateTodoInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const updateData: any = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.due_at !== undefined) updateData.due_at = input.due_at
  if (input.status !== undefined) updateData.status = input.status
  if (input.priority !== undefined) updateData.priority = input.priority
  if (input.tags !== undefined) updateData.tags = input.tags

  const { data, error } = await supabase
    .from('todos')
    .update(updateData)
    .eq('id', input.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/todos')
  revalidatePath('/today')
  return data
}

export async function deleteTodo(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/todos')
  revalidatePath('/today')
}

