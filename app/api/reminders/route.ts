import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Try to query with is_completed filter first (if migration has been run)
    let query = supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('remind_at', { ascending: true })

    // Try to filter by is_completed, but handle case where column doesn't exist yet
    const { data, error } = await query.eq('is_completed', false)

    // If error is about missing column, try without the filter
    if (error && error.code === '42703') {
      // Column doesn't exist yet - query without filter
      const { data: dataWithoutFilter, error: errorWithoutFilter } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('remind_at', { ascending: true })

      if (errorWithoutFilter) {
        return NextResponse.json({ error: errorWithoutFilter.message }, { status: 500 })
      }

      // Map old format to new format with defaults
      const mappedData = (dataWithoutFilter || []).map((reminder: any) => ({
        ...reminder,
        repeat_type: null,
        repeat_interval: 1,
        repeat_end_date: null,
        repeat_count: null,
        event_id: null,
        is_completed: false,
        last_reminded_at: null,
      }))

      return NextResponse.json(mappedData)
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

