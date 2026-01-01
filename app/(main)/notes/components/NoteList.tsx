'use client'

import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils/date'
import type { Note } from '@/lib/queries/notes'

interface NoteListProps {
  notes: Note[]
  selectedNoteId: string | null
  onSelectNote: (noteId: string) => void
}

export function NoteList({ notes, selectedNoteId, onSelectNote }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="p-8">
        <p className="text-sm text-text-tertiary">No notes yet</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-1">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelectNote(note.id)}
            className={`
              p-4 cursor-pointer border-l-2 transition-colors
              ${selectedNoteId === note.id
                ? 'border-text-primary bg-bg-secondary'
                : 'border-transparent hover:bg-bg-secondary'
              }
            `}
          >
            <h3 className="text-base text-text-primary mb-1 truncate">
              {note.title || 'Untitled'}
            </h3>
            {note.body_md && (
              <p className="text-sm text-text-tertiary line-clamp-2 mb-2">
                {note.body_md.replace(/[#*`]/g, '').substring(0, 100)}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span>{formatDate(note.updated_at)}</span>
              {note.tags && note.tags.length > 0 && (
                <span className="flex gap-1">
                  {note.tags.slice(0, 2).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

