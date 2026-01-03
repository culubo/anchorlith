import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request, context: { params?: Record<string, string> } | Promise<{ params?: Record<string, string> }>) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Normalize params: Next may pass them directly, nested, or as a Promise
    const maybeContext = context && typeof context.then === 'function' ? await context : context
    const paramsResolved = maybeContext?.params ? await maybeContext.params : maybeContext
    const noteId = paramsResolved?.id

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

