import { createTodo } from '@/app/(main)/todos/actions'
import { updateNote } from '@/app/(main)/notes/actions'

// Date pattern regexes
const DATE_PATTERNS = [
  /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g, // MM/DD/YYYY
  /\b(\d{1,2}\/\d{1,2})\b/g, // MM/DD
  /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,\s+\d{4})?\b/gi, // Jan 8, 2026
  /\b\d{4}-\d{2}-\d{2}\b/g, // YYYY-MM-DD
]

export function detectDateInText(text: string): Date | null {
  for (const pattern of DATE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      try {
        const date = new Date(matches[0])
        if (!isNaN(date.getTime())) {
          return date
        }
      } catch {
        // Invalid date, continue
      }
    }
  }
  return null
}

export async function suggestTodoFromEvent(
  eventTitle: string,
  eventStartAt: string
): Promise<boolean> {
  // Check if event title contains "task:" prefix or checklist indicators
  const hasTaskPrefix = /^task:\s*/i.test(eventTitle)
  const hasChecklist = /\[[\sx]\]/i.test(eventTitle)

  if (hasTaskPrefix || hasChecklist) {
    try {
      // Extract task title (remove prefix/checklist markers)
      let taskTitle = eventTitle
        .replace(/^task:\s*/i, '')
        .replace(/\[[\sx]\]\s*/gi, '')
        .trim()

      if (!taskTitle) {
        taskTitle = eventTitle.trim()
      }

      await createTodo({
        title: taskTitle,
        due_at: eventStartAt,
      })

      return true
    } catch (error) {
      console.error('Failed to create todo from event:', error)
      return false
    }
  }

  return false
}

export async function suggestDateLinkForNote(
  noteId: string,
  noteBody: string
): Promise<Date | null> {
  const detectedDate = detectDateInText(noteBody)
  
  if (detectedDate) {
    // Check if note already has a linked_date
    // This would require fetching the note first, but for simplicity
    // we'll just return the detected date and let the UI handle it
    return detectedDate
  }

  return null
}

export function isEventToday(eventStartAt: string): boolean {
  const eventDate = new Date(eventStartAt)
  const today = new Date()
  
  return (
    eventDate.getDate() === today.getDate() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getFullYear() === today.getFullYear()
  )
}

