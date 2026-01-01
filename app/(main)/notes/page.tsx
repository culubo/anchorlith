'use client'

import { useState, useEffect } from 'react'
import { NoteList } from './components/NoteList'
import { NoteEditor } from './components/NoteEditor'
import { motion } from 'framer-motion'

export interface Note {
  id: string
  user_id: string
  title: string
  body_md: string | null
  tags: string[]
  linked_date: string | null
  created_at: string
  updated_at: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [allowEdit, setAllowEdit] = useState(true)
  const [showEditor, setShowEditor] = useState(false)

  const loadNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      if (!response.ok) throw new Error('Failed to fetch notes')
      const data = await response.json()
      setNotes(data)
      if (data.length > 0 && !selectedNoteId) {
        setSelectedNoteId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadSelectedNote = async () => {
      if (selectedNoteId) {
        try {
          const response = await fetch(`/api/notes/${selectedNoteId}`)
          if (!response.ok) throw new Error('Failed to fetch note')
          const note = await response.json()
          setSelectedNote(note)
        } catch (error) {
          console.error('Failed to load note:', error)
        }
      } else {
        setSelectedNote(null)
      }
    }
    loadSelectedNote()
  }, [selectedNoteId])

  const handleNoteChange = (clearEditor = false) => {
    loadNotes()
    if (clearEditor) {
      // Clear editor to allow creating new note
      setSelectedNoteId(null)
      setSelectedNote(null)
    } else if (selectedNoteId) {
      // Reload the selected note
      const loadSelectedNote = async () => {
        try {
          const response = await fetch(`/api/notes/${selectedNoteId}`)
          if (!response.ok) throw new Error('Failed to fetch note')
          const note = await response.json()
          setSelectedNote(note)
        } catch (error) {
          console.error('Failed to reload note:', error)
        }
      }
      loadSelectedNote()
    }
  }

  const handleNewNote = () => {
    setSelectedNoteId(null)
    setSelectedNote(null)
    setShowEditor(false)
  }

  // On mobile, show editor when note is selected
  useEffect(() => {
    if (selectedNoteId && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowEditor(true)
    } else if (!selectedNoteId) {
      setShowEditor(false)
    }
  }, [selectedNoteId])

  if (loading) {
    return <div className="text-text-secondary">Loading...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-[calc(100vh-12rem)] grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8"
    >
      <div className={`lg:border-r border-border-subtle lg:pr-8 ${showEditor ? 'hidden lg:block' : 'block'}`}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl text-text-primary">Notes</h1>
          <button
            onClick={handleNewNote}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] px-2"
          >
            New Note
          </button>
        </div>
        <NoteList
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={(id) => {
            setSelectedNoteId(id)
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              setShowEditor(true)
            }
          }}
        />
      </div>

      <div className={`pl-0 lg:pl-8 ${!showEditor && selectedNoteId ? 'hidden lg:block' : showEditor ? 'block' : 'hidden lg:block'}`}>
        <div className="lg:hidden mb-4 flex items-center gap-2">
          <button
            onClick={() => setShowEditor(false)}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] px-2"
          >
            ← Back
          </button>
        </div>
        <NoteEditor 
          note={selectedNote} 
          onNoteChange={handleNoteChange}
          allowEdit={allowEdit}
        />
      </div>
    </motion.div>
  )
}

