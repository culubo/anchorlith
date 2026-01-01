-- Optimize RLS policies for better performance
-- This migration fixes the auth_rls_initplan warnings by using (select auth.uid())
-- and consolidates multiple permissive policies

-- Drop existing policies to recreate them optimized
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

DROP POLICY IF EXISTS "Users can view their own todos" ON todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON todos;

DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can insert their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;

DROP POLICY IF EXISTS "Users can view their own files" ON files;
DROP POLICY IF EXISTS "Users can insert their own files" ON files;
DROP POLICY IF EXISTS "Users can update their own files" ON files;
DROP POLICY IF EXISTS "Users can delete their own files" ON files;

DROP POLICY IF EXISTS "Users can view their own public pages" ON public_pages;
DROP POLICY IF EXISTS "Public pages are viewable when public or unlisted" ON public_pages;
DROP POLICY IF EXISTS "Users can insert their own public pages" ON public_pages;
DROP POLICY IF EXISTS "Users can update their own public pages" ON public_pages;
DROP POLICY IF EXISTS "Users can delete their own public pages" ON public_pages;

-- Notes policies (optimized)
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Todos policies (optimized)
CREATE POLICY "Users can view their own todos"
  ON todos FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own todos"
  ON todos FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Events policies (optimized)
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Reminders policies (optimized)
CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON reminders FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Files policies (optimized)
CREATE POLICY "Users can view their own files"
  ON files FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own files"
  ON files FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own files"
  ON files FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own files"
  ON files FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Public pages policies (optimized and consolidated)
-- Combined SELECT policy to avoid multiple permissive policies
CREATE POLICY "Public pages access policy"
  ON public_pages FOR SELECT
  USING (
    visibility = 'public' OR
    visibility = 'unlisted' OR
    (select auth.uid()) = user_id
  );

CREATE POLICY "Users can insert their own public pages"
  ON public_pages FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own public pages"
  ON public_pages FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own public pages"
  ON public_pages FOR DELETE
  USING ((select auth.uid()) = user_id);

