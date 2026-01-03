import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  const expected = process.env.ADMIN_ENDPOINT_SECRET

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const batchSize = Math.min(500, Number(body.batchSize) || 100)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRole) {
    return NextResponse.json({ error: 'Missing service role key or supabase url' }, { status: 500 })
  }

  const admin = createClient(supabaseUrl, serviceRole)

  try {
    // Use admin API to list users in pages
    let page = 1
    let processed = 0
    let errors: Array<{ email?: string; message: string }> = []

    while (processed < batchSize) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: Math.min(100, batchSize - processed) })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const users = data?.users || []
      if (users.length === 0) break

      for (const user of users) {
        try {
          if (!user.email) continue
          // Send reset password email
          const { error: resetErr } = await admin.auth.resetPasswordForEmail(user.email)
          if (resetErr) {
            errors.push({ email: user.email, message: resetErr.message })
          }
          processed++
          if (processed >= batchSize) break
        } catch (e: any) {
          errors.push({ email: user.email, message: e?.message || String(e) })
        }
      }

      if (users.length < 1) break
      page++
    }

    return NextResponse.json({ ok: true, processed, errors })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
