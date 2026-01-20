'use client'

import { useState, useEffect } from 'react'
import { CommandPreview } from './CommandPreview'
import { CommandEditor } from './CommandEditor'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { createNote, updateNote, deleteNote } from '../actions'
import type { Note } from '@/lib/queries/notes'
import TableEditor from './TableEditor'
import DrawingPad from './DrawingPad'
import { parseCSVToMarkdownTable, parseICSToList } from '@/lib/importers'

interface NoteEditorProps {
  note: Note | null
  onNoteChange: (clearEditor?: boolean) => void
  allowEdit?: boolean
}

export function NoteEditor({ note, onNoteChange, allowEdit = true }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [canEditPastNotes, setCanEditPastNotes] = useState(true)
  const [todoStates, setTodoStates] = useState<Record<number, boolean>>({})
  const [showTableEditor, setShowTableEditor] = useState(false)
  const [showDrawingPad, setShowDrawingPad] = useState(false)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showAISuggestion, setShowAISuggestion] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setBody(note.body_md || '')
      // Reset todo states when note changes
      setTodoStates({})
    } else {
      setTitle('')
      setBody('')
      setTodoStates({})
    }
  }, [note])

  const handleToggleTodo = (lineIndex: number) => {
    setTodoStates(prev => ({
      ...prev,
      [lineIndex]: !prev[lineIndex]
    }))
  }

  const handleSave = async () => {
    if (!title.trim()) return

    setIsSaving(true)
    try {
      if (note) {
        await updateNote({
          id: note.id,
          title: title.trim(),
          body_md: body.trim() || undefined,
        })
        // After updating, clear editor if allowEdit is true
        if (allowEdit) {
          setTitle('')
          setBody('')
          onNoteChange(true) // Clear editor
        } else {
          onNoteChange(false) // Just reload
        }
      } else {
        await createNote({
          title: title.trim(),
          body_md: body.trim() || undefined,
        })
        // After creating, clear editor for new note
        setTitle('')
        setBody('')
        onNoteChange(true) // Clear editor
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!note) return
    if (!confirm('Delete this note?')) return

    try {
      await deleteNote(note.id)
      onNoteChange()
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  // Calculate editable state before using it in useEffect
  const isEditable = !note || (note && canEditPastNotes && allowEdit)
  const isNewNote = !note
  const shouldShowPreview = isPreview || (note && !isEditable)

  // Keyboard shortcut for preview toggle (Cmd/Ctrl + P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        if (isEditable) {
          setIsPreview(!isPreview)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPreview, isEditable])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-subtle">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="text-lg font-medium flex-1"
          onKeyDown={handleKeyDown}
          disabled={!isEditable}
        />
        <div className="flex items-center gap-2 ml-4">
          {note && (
            <Checkbox
              checked={canEditPastNotes}
              onChange={(e) => {
                setCanEditPastNotes(e.target.checked)
                setIsPreview(!e.target.checked) // Toggle preview based on edit checkbox
              }}
              label="Edit"
              className="text-sm"
            />
          )}
          {note && isEditable && (
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="text-sm text-red-500 hover:text-red-600"
            >
              Delete
            </Button>
          )}
          {isEditable && (
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="text-sm"
            >
              {isSaving ? 'Saving...' : isNewNote ? 'Create' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mb-3">
          {aiError && (
            <div className="text-sm text-red-500 mb-2">{aiError}</div>
          )}
          {showAISuggestion && aiSuggestion && (
            <div className="w-full p-3 border border-border-subtle rounded bg-bg-elevated mb-2">
              <div className="prose max-w-none text-sm text-text-primary whitespace-pre-wrap">{aiSuggestion}</div>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => { setBody(prev => prev + '\n\n' + aiSuggestion); setShowAISuggestion(false); setAiSuggestion(null) }} className="text-sm">Insert</Button>
                <Button onClick={() => { setBody(aiSuggestion || ''); setShowAISuggestion(false); setAiSuggestion(null) }} className="text-sm">Replace</Button>
                <Button onClick={() => { setShowAISuggestion(false); setAiSuggestion(null) }} variant="ghost" className="text-sm">Close</Button>
              </div>
            </div>
          )}

          <details className="group">
            <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary list-none flex items-center gap-2">
              <span className="group-open:hidden">+</span>
              <span className="group-open:hidden">Tools</span>
              <span className="hidden group-open:inline">−</span>
              <span className="hidden group-open:inline">Tools</span>
            </summary>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button onClick={() => setShowTableEditor(true)} variant="ghost" className="text-xs">Table</Button>
              <Button onClick={() => setShowDrawingPad(true)} variant="ghost" className="text-xs">Drawing</Button>
              <Button
                onClick={async () => {
                  // Check opt-in
                  const enabled = typeof window !== 'undefined' && localStorage.getItem('predictiveWritingOptIn') === 'true'
                  if (!enabled) {
                    if (!confirm('Predictive writing is disabled. Enable it in Settings?')) return
                    try { localStorage.setItem('predictiveWritingOptIn', 'true') } catch (e) {}
                  }

                  // Fetch suggestion
                  setAiLoading(true)
                  setAiError(null)
                  try {
                    const resp = await fetch('/api/ai/suggest', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ context: body || note?.body_md || '', instructions: 'Continue the note in a concise, helpful way. Return only the suggested content without commentary.' }),
                    })

                    if (resp.status === 501) {
                      setAiError('Server not configured for AI suggestions (OPENAI_API_KEY missing)')
                      setAiLoading(false)
                      return
                    }

                    if (!resp.ok) {
                      const txt = await resp.text()
                      setAiError('Failed to get suggestion: ' + txt)
                      setAiLoading(false)
                      return
                    }

                    const json = await resp.json()
                    setAiSuggestion(typeof json.suggestion === 'string' ? json.suggestion : '')
                    setShowAISuggestion(true)
                  } catch (err: any) {
                    setAiError(err?.message || 'Unknown error')
                  } finally {
                    setAiLoading(false)
                  }
                }}
                variant="ghost"
                className="text-xs"
                disabled={!isEditable}
              >
                {aiLoading ? 'Loading…' : 'Suggestion'}
              </Button>
              <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                <span>Import</span>
                <input type="file" accept="text/csv,text/plain,text/calendar" onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const text = await file.text()
                  if (file.type === 'text/csv') {
                    const md = parseCSVToMarkdownTable(text)
                    setBody(prev => prev + '\n\n' + md)
                  } else if (file.type === 'text/calendar' || file.name.endsWith('.ics')) {
                    const list = parseICSToList(text)
                    setBody(prev => prev + '\n\n' + list)
                  } else {
                    // fallback - append raw text as a code block
                    setBody(prev => `${prev}\n\n\`\`\`\n${text}\n\`\`\``)
                  }
                }} className="text-xs" />
              </label>
            </div>
          </details>
        </div>

        {shouldShowPreview ? (
          <CommandPreview 
            content={body || note?.body_md || ''} 
            onToggleTodo={handleToggleTodo}
            todoStates={todoStates}
            onContentUpdate={(newContent) => {
              setBody(newContent)
            }}
          />
        ) : (
          <CommandEditor
            value={body}
            onChange={setBody}
            onKeyDown={handleKeyDown}
            placeholder="Start writing... Use /todo, /list, /calendar, or /image commands"
            disabled={!isEditable}
          />
        )}
      </div>

      {showTableEditor && (
        <div className="fixed inset-0 flex items-start justify-center p-4">
          <div className="bg-bg-primary border border-border-subtle rounded w-full max-w-2xl p-4 z-50">
            <TableEditor onSave={(md) => { setBody(prev => prev + '\n\n' + md); setShowTableEditor(false) }} onClose={() => setShowTableEditor(false)} />
          </div>
        </div>
      )}

      {showDrawingPad && (
        <div className="fixed inset-0 flex items-start justify-center p-4">
          <div className="bg-bg-primary border border-border-subtle rounded w-full max-w-2xl p-4 z-50">
            <DrawingPad onSave={(dataUrl) => { setBody(prev => prev + '\n\n' + `![](${dataUrl})`); setShowDrawingPad(false) }} onClose={() => setShowDrawingPad(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

