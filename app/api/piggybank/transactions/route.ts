import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json()
  const { amount, type, note } = body

  if (!amount || !['deposit', 'withdrawal'].includes(type)) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }

  // Ensure piggybank exists
  const { data: pb, error: pbErr } = await supabase
    .from('piggybanks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (pbErr && pbErr.code !== 'PGRST116') return NextResponse.json({ error: pbErr.message }, { status: 500 })

  let piggybankId = pb?.id
  let balance = pb?.balance ?? 0

  if (!piggybankId) {
    // create a piggybank for the user
    const { data: created, error: createErr } = await supabase.from('piggybanks').insert({ user_id: user.id }).select().single()
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
    piggybankId = created.id
    balance = created.balance
  }

  const newBalance = type === 'deposit' ? Number(balance) + Number(amount) : Number(balance) - Number(amount)

  const { data, error } = await supabase
    .from('piggybank_transactions')
    .insert({ piggybank_id: piggybankId, amount, type, note })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update balance
  const { data: updated, error: updErr } = await supabase
    .from('piggybanks')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', piggybankId)
    .select()
    .single()

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  return NextResponse.json({ transaction: data, piggybank: updated })
}
