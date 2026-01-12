-- Add repeating reminder and event linking features
-- This migration extends reminders with repeat functionality and event linking

-- Add new columns to reminders table
ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS repeat_type TEXT CHECK (repeat_type IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS repeat_interval INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS repeat_end_date TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS repeat_count INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for event_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reminders_event_id ON reminders(event_id);

-- Add index for repeat_type to optimize queries
CREATE INDEX IF NOT EXISTS idx_reminders_repeat_type ON reminders(repeat_type);

-- Add index for is_completed to filter active reminders
CREATE INDEX IF NOT EXISTS idx_reminders_is_completed ON reminders(is_completed);

-- Add constraint to ensure repeat_count is positive
ALTER TABLE reminders
  ADD CONSTRAINT check_repeat_count_positive CHECK (repeat_count IS NULL OR repeat_count > 0);

-- Add constraint to ensure repeat_interval is positive
ALTER TABLE reminders
  ADD CONSTRAINT check_repeat_interval_positive CHECK (repeat_interval > 0);



