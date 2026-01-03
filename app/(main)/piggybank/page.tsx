'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Divider } from '@/components/ui/Divider'

type Tx = {
  id: string
  amount: number
  type: 'deposit' | 'withdrawal'
  date: string
  note?: string
}

type State = {
  target: number
  balance: number
  transactions: Tx[]
}

const STORAGE_KEY = 'piggybank.v1'

export default function PiggybankPage() {
  const [targetInput, setTargetInput] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [state, setState] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as State) : { target: 0, balance: 0, transactions: [] }
    } catch {
      return { target: 0, balance: 0, transactions: [] }
    }
  })


  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error('failed to persist piggybank', e)
    }
  }, [state])

  const [isSignedIn, setIsSignedIn] = useState(false)
  const [loadingRemote, setLoadingRemote] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingRemote(true)
      try {
        if (typeof window === 'undefined') return
        const createBrowserClient = (await import('@/lib/supabase/client')).createClient
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!mounted) return
        if (!user) {
          setIsSignedIn(false)
          setLoadingRemote(false)
          return
        }

        setIsSignedIn(true)
        const res = await fetch('/api/piggybank')
        if (!res.ok) {
          setLoadingRemote(false)
          return
        }
        const json = await res.json()
        if (json?.piggybank) {
          setState(prev => ({ ...prev, target: Number(json.piggybank.target || 0), balance: Number(json.piggybank.balance || 0), transactions: (json.piggybank.piggybank_transactions || []).map((t: any) => ({ id: t.id, amount: Number(t.amount), type: t.type, date: t.created_at, note: t.note })) }))
        }
      } catch (err) {
        console.error('failed to fetch piggybank', err)
      } finally {
        if (mounted) setLoadingRemote(false)
      }
    })()

    return () => { mounted = false }
  }, [])



  const setTarget = async (n: number) => {
    setState(prev => ({ ...prev, target: n }))
    if (!isSignedIn) return
    try {
      setLoadingRemote(true)
      await fetch('/api/piggybank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: n }) })
    } catch (err) {
      console.error('failed to save target', err)
    } finally {
      setLoadingRemote(false)
    }
  }

  const addTx = async (amt: number, type: Tx['type']) => {
    if (!amt || isNaN(amt)) return

    if (!isSignedIn) {
      const prev = state.balance
      const newBalance = type === 'deposit' ? prev + amt : prev - amt
      const tx: Tx = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, amount: amt, type, date: new Date().toISOString() }
      setState(prev => ({ ...prev, balance: newBalance, transactions: [tx, ...prev.transactions] }))
      return
    }

    // Server-backed flow
    try {
      setLoadingRemote(true)
      const res = await fetch('/api/piggybank/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: amt, type }) })
      if (!res.ok) {
        console.error('failed to add tx', await res.text())
        return
      }
      const json = await res.json()
      if (json?.piggybank) {
        setState(prev => ({ ...prev, target: Number(json.piggybank.target || prev.target), balance: Number(json.piggybank.balance || prev.balance), transactions: [(json.transaction ? { id: json.transaction.id, amount: Number(json.transaction.amount), type: json.transaction.type, date: json.transaction.created_at, note: json.transaction.note } : null) as Tx, ...prev.transactions].filter(Boolean) }))
      }
    } catch (err) {
      console.error('failed to add tx', err)
    } finally {
      setLoadingRemote(false)
    }
  }

  const clearAll = async () => {
    if (!confirm('Clear piggybank and all transactions?')) return
    if (!isSignedIn) {
      setState({ target: 0, balance: 0, transactions: [] })
      return
    }

    try {
      setLoadingRemote(true)
      const res = await fetch('/api/piggybank', { method: 'DELETE' })
      if (!res.ok) {
        console.error('failed to clear', await res.text())
        return
      }
      setState({ target: 0, balance: 0, transactions: [] })
    } catch (err) {
      console.error('failed to clear', err)
    } finally {
      setLoadingRemote(false)
    }
  }

  const progress = useMemo(() => {
    if (!state.target || state.target <= 0) return 0
    return Math.min(100, Math.round((state.balance / state.target) * 100))
  }, [state.target, state.balance])

  return (
    <div>
      <h1 className="text-2xl mb-6 text-text-primary">Piggybank</h1>

      <div className="space-y-6">
        <div className="bg-bg-elevated border border-border-subtle rounded p-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-text-secondary">Target</div>
              <div className="text-xl font-medium">${state.target.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Balance</div>
              <div className="text-xl font-medium">${state.balance.toFixed(2)}</div>
            </div>
            <div className="ml-auto w-48">
              <div className="h-2 bg-border-subtle rounded overflow-hidden">
                <div className="h-full bg-green-500 rounded" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-text-secondary mt-1">{progress}% of target</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="Set target amount"
                className="w-full"
              />
              <div className="mt-2 flex gap-2">
                <Button onClick={async () => { const n = parseFloat(targetInput || '0'); if (!isNaN(n)) await setTarget(n); setTargetInput('') }} className="text-sm" disabled={loadingRemote}>Set target</Button>
                <Button variant="ghost" className="text-sm" onClick={async () => { await setTarget(0); setTargetInput('') }} disabled={loadingRemote}>Clear</Button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <Input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="Amount to add/remove"
                className="w-full"
              />

              <div className="mt-2 flex gap-2">
                <Button onClick={async () => { const n = parseFloat(amountInput || '0'); if (!isNaN(n)) await addTx(n, 'deposit'); setAmountInput('') }} className="text-sm" disabled={loadingRemote}>Add</Button>
                <Button onClick={async () => { const n = parseFloat(amountInput || '0'); if (!isNaN(n)) await addTx(n, 'withdrawal'); setAmountInput('') }} variant="ghost" className="text-sm" disabled={loadingRemote}>Remove</Button>
                <Button onClick={async () => { await clearAll() }} variant="ghost" className="text-sm ml-auto text-red-500" disabled={loadingRemote}>Reset</Button>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <h2 className="text-lg mb-3 text-text-primary">Transactions</h2>
          {state.transactions.length === 0 ? (
            <div className="text-sm text-text-secondary">No transactions yet. Add or remove funds above.</div>
          ) : (
            <div className="space-y-3">
              {state.transactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 bg-bg-elevated border border-border-subtle p-3 rounded">
                  <div className="text-sm w-24 text-text-secondary">{new Date(tx.date).toLocaleString()}</div>
                  <div className="flex-1">
                    <div className="text-sm">{tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</div>
                  </div>
                  <div className={`text-sm font-medium ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
