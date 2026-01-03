'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface TableEditorProps {
  onSave: (markdownTable: string) => void
  onClose: () => void
}

export default function TableEditor({ onSave, onClose }: TableEditorProps) {
  const [rows, setRows] = useState(2)
  const [cols, setCols] = useState(2)
  const [headers, setHeaders] = useState<string[]>(Array(2).fill(''))
  const [cells, setCells] = useState<string[][]>(Array.from({ length: 2 }, () => Array(2).fill('')))

  const ensureSize = (r: number, c: number) => {
    if (headers.length !== c) setHeaders(Array(c).fill(''))
    if (cells.length !== r) setCells(Array.from({ length: r }, () => Array(c).fill('')))
  }

  const handleSave = () => {
    // Build markdown table
    const headerLine = `| ${headers.join(' | ')} |`
    const sepLine = `| ${headers.map(() => '---').join(' | ')} |`
    const rowLines = cells.map(row => `| ${row.join(' | ')} |`)
    const md = [headerLine, sepLine, ...rowLines].join('\n')
    onSave(md)
    onClose()
  }

  return (
    <div className="p-4 bg-bg-secondary rounded shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Cols</label>
          <input type="number" min={1} value={cols} onChange={(e) => { const c = Math.max(1, Number(e.target.value)); setCols(c); ensureSize(rows, c); }} className="w-16" />
          <label className="text-sm text-text-secondary">Rows</label>
          <input type="number" min={1} value={rows} onChange={(e) => { const r = Math.max(1, Number(e.target.value)); setRows(r); ensureSize(r, cols); }} className="w-16" />
        </div>
        <div className="ml-auto flex gap-2">
          <Button onClick={handleSave} className="text-sm">Insert Table</Button>
          <Button onClick={onClose} variant="ghost" className="text-sm">Cancel</Button>
        </div>
      </div>

      <div className="overflow-auto">
        <div className="mb-2 text-xs text-text-secondary">Headers</div>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {Array.from({ length: cols }).map((_, i) => (
            <input key={`h-${i}`} className="border px-2 py-1" placeholder={`Header ${i + 1}`} value={headers[i] || ''} onChange={(e) => setHeaders(prev => { const copy = [...prev]; copy[i] = e.target.value; return copy })} />
          ))}
        </div>
        <div className="text-xs text-text-secondary mb-2">Cells</div>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, r) => (
            <div className="grid grid-cols-6 gap-2" key={`row-${r}`}>
              {Array.from({ length: cols }).map((__, c) => (
                <input key={`c-${r}-${c}`} className="border px-2 py-1" placeholder={`R${r + 1}C${c + 1}`} value={(cells[r] && cells[r][c]) || ''} onChange={(e) => setCells(prev => { const copy = prev.map(row => [...row]); copy[r][c] = e.target.value; return copy })} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
