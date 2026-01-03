-- Add username field to public_pages for user-specific URLs
-- This allows URLs like anchorlith.com/username/resume

-- Add username column (nullable for backward compatibility)
ALTER TABLE public_pages
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_public_pages_username ON public_pages(username);

-- Create unique constraint on username + type combination
-- This ensures one resume, one portfolio, one links per username
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_pages_username_type 
  ON public_pages(username, type) 
  WHERE username IS NOT NULL;


