'use client'

import { useState, useEffect } from 'react'
import { CommandPreview } from './CommandPreview'
import { CommandEditor } from './CommandEditor'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { createNote, updateNote, deleteNote } from '../actions'
import type { Note } from '@/lib/queries/notes'
import dynamic from 'next/dynamic'
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
                if (!e.target.checked) {
                  setIsPreview(true) // Auto-switch to preview when edit is disabled
                }
              }}
              label="Edit"
              className="text-sm"
            />
          )}
          {isEditable && (
            <Button
              onClick={() => setIsPreview(!isPreview)}
              variant="ghost"
              className="text-sm"
            >
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
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
        <div className="mb-3 flex items-center gap-2">
          <Button onClick={() => setShowTableEditor(true)} variant="ghost" className="text-sm">Insert Table</Button>
          <Button onClick={() => setShowDrawingPad(true)} variant="ghost" className="text-sm">Insert Drawing</Button>
          <label className="flex items-center gap-2 text-sm ml-auto">
            <span className="text-text-secondary">Import</span>
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
            }} />
          </label>
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

