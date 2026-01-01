'use client'

import { useState, useEffect } from 'react'
import { CommandPreview } from './CommandPreview'
import { CommandEditor } from './CommandEditor'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { createNote, updateNote, deleteNote } from '../actions'
import { motion } from 'framer-motion'
import type { Note } from '@/lib/queries/notes'

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

  const isEditable = !note || (note && canEditPastNotes && allowEdit)
  const isNewNote = !note
  const shouldShowPreview = isPreview || (note && !isEditable)

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
        {shouldShowPreview ? (
          <CommandPreview 
            content={body || note?.body_md || ''} 
            onToggleTodo={handleToggleTodo}
            todoStates={todoStates}
          />
        ) : (
          <CommandEditor
            value={body}
            onChange={setBody}
            onKeyDown={handleKeyDown}
            placeholder="Start writing... Use /todo, /list, or /calendar commands"
            disabled={!isEditable}
          />
        )}
      </div>
    </div>
  )
}

